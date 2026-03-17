import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { UserBadge } from '@/models/UserBadge';
import { PodProject } from '@/models/PodProject';
import { College } from '@/models/College';
import { serializeProfileMemberships } from '@/lib/builder-pods/membership';
import mongoose from 'mongoose';

export async function GET(
    req: NextRequest,
    { params }: { params: { wallet: string } }
) {
    try {
        await dbConnect();

        const wallet = params.wallet.toLowerCase();
        if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
            return NextResponse.json(
                { success: false, error: 'Invalid wallet address' },
                { status: 400 }
            );
        }

        const members = await PodMember.find({
            walletAddress: wallet,
            deletedAt: null,
            status: { $in: ['active', 'pending', 'inactive'] },
        })
            .sort({ createdAt: -1 })
            .lean() as any[];

        if (!members.length) {
            return NextResponse.json({
                success: true,
                enrolled: false,
            });
        }
        const collegeIds = [...new Set(members.map(m => m.collegeId.toString()))];

        const [colleges, badges, projectsByCollege] = await Promise.all([
            College.find({ _id: { $in: collegeIds } })
                .select('name slug city state podName')
                .lean(),
            UserBadge.find({ walletAddress: wallet }).sort({ assignedAt: -1 }).lean(),
            PodProject.aggregate([
                {
                    $match: {
                        createdBy: wallet,
                        deletedAt: null,
                        collegeId: { $in: collegeIds.map((id) => new mongoose.Types.ObjectId(id)) },
                    },
                },
                {
                    $group: {
                        _id: '$collegeId',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const collegeMap = new Map<string, any>();
        colleges.forEach((c: any) => collegeMap.set(c._id.toString(), c));

        const projectCountMap = new Map<string, number>();
        projectsByCollege.forEach((p: any) => {
            projectCountMap.set(p._id.toString(), p.count);
        });

        return NextResponse.json({
            success: true,
            enrolled: true,
            memberships: serializeProfileMemberships(members, collegeMap, projectCountMap),
            badges: badges.map((b: any) => ({
                _id: b._id,
                slug: b.badgeSnapshot?.slug,
                label: b.badgeSnapshot?.label,
                assignedAt: b.assignedAt,
                easUid: b.easUid,
                onChainAttested: b.onChainAttested,
            })),
        });
    } catch (error) {
        console.error('Error fetching builder-pods profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
