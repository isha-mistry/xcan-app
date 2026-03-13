import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { UserBadge } from '@/models/UserBadge';
import { PodProject } from '@/models/PodProject';
import { College } from '@/models/College';

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

        const member = await PodMember.findOne({
            walletAddress: wallet,
            deletedAt: null,
        }).lean() as any;

        if (!member) {
            return NextResponse.json({
                success: true,
                enrolled: false,
            });
        }

        const [college, badges, projectCount] = await Promise.all([
            College.findById(member.collegeId).select('name slug city state podName').lean(),
            UserBadge.find({ walletAddress: wallet }).sort({ assignedAt: -1 }).lean(),
            PodProject.countDocuments({
                collegeId: member.collegeId,
                createdBy: wallet,
                deletedAt: null,
            }),
        ]);

        return NextResponse.json({
            success: true,
            enrolled: true,
            member: {
                name: member.name,
                role: member.role,
                status: member.status,
                programmingLevel: member.programmingLevel,
                githubUsername: member.githubUsername,
                stylusModulesCompleted: member.stylusModulesCompleted,
                contractsDeployed: member.contractsDeployed,
                totalScore: member.totalScore,
                individualRank: member.individualRank,
                joinedAt: member.createdAt,
            },
            college: college || null,
            badges: badges.map((b: any) => ({
                _id: b._id,
                slug: b.badgeSnapshot?.slug,
                label: b.badgeSnapshot?.label,
                assignedAt: b.assignedAt,
                easUid: b.easUid,
                onChainAttested: b.onChainAttested,
            })),
            projectCount,
        });
    } catch (error) {
        console.error('Error fetching builder-pods profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
