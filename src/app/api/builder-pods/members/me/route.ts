import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { UserBadge } from '@/models/UserBadge';
import { Deployment } from '@/models/Deployment';
import { College } from '@/models/College';
import { PodProject } from '@/models/PodProject';
import { getAuthContext, UnauthorizedError } from '@/lib/rbac';
import {
    pickPrimaryMembership,
    serializeProfileMemberships,
} from '@/lib/builder-pods/membership';
import mongoose from 'mongoose';

// GET — get current user's pod profile
// Requires: any authenticated user (wallet from JWT/session)
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();

        // Wallet comes from verified auth context, not query param
        const w = ctx.walletAddress;

        const [memberDocuments, badges, deployments] = await Promise.all([
            PodMember.find({ walletAddress: w, deletedAt: null })
                .lean(),

            UserBadge.find({ walletAddress: w })
                .sort({ assignedAt: -1 })
                .lean(),

            Deployment.find({ walletAddress: w, isVerified: true })
                .select('txHash contractAddress description createdAt')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
        ]);

        const collegeIds = [...new Set(memberDocuments.map((member: any) => member.collegeId.toString()))];

        const [colleges, projectsByCollege] = collegeIds.length
            ? await Promise.all([
                College.find({ _id: { $in: collegeIds } })
                    .select('name slug city state podName')
                    .lean(),
                PodProject.aggregate([
                    {
                        $match: {
                            createdBy: w,
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
            ])
            : [[], []];

        const collegeMap = new Map<string, any>();
        colleges.forEach((college: any) => {
            collegeMap.set(college._id.toString(), college);
        });

        const projectCountMap = new Map<string, number>();
        projectsByCollege.forEach((project: any) => {
            projectCountMap.set(project._id.toString(), project.count);
        });

        const memberships = serializeProfileMemberships(memberDocuments as any[], collegeMap, projectCountMap);
        const primaryMembership = pickPrimaryMembership(memberDocuments as any[]);
        const membership = primaryMembership
            ? {
                ...primaryMembership,
                collegeId: collegeMap.get(primaryMembership.collegeId.toString()) ?? null,
            }
            : null;

        return NextResponse.json({
            success: true,
            membership,
            memberships,
            badges: badges.map((badge: any) => ({
                _id: badge._id,
                slug: badge.badgeSnapshot?.slug,
                label: badge.badgeSnapshot?.label,
                assignedAt: badge.assignedAt,
                easUid: badge.easUid,
                onChainAttested: badge.onChainAttested,
            })),
            recentDeployments: deployments,
            stats: {
                totalBadges: badges.length,
                totalVerifiedDeployments: deployments.length,
                modules: primaryMembership?.stylusModulesCompleted ?? 0,
                score: primaryMembership?.totalScore ?? 0,
                rank: primaryMembership?.individualRank ?? null,
            },
        }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        console.error('Error fetching user pod profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
