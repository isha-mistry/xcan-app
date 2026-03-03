import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { Deployment } from '@/models/Deployment';
import { PodProject } from '@/models/PodProject';
import { UserBadge } from '@/models/UserBadge';

/**
 * Cron: Refresh cached analytics stats every 30 minutes.
 * Schedule: "* /30 * * * *"
    *
 * This recalculates denormalized counters on College documents
    * so that public analytics endpoints return fast results.
 */
export async function GET() {
    try {
        await dbConnect();

        const colleges = await College.find({ deletedAt: null }, '_id').lean();

        for (const college of colleges) {
            const cid = college._id;
            const [memberCount, activeMemberCount, projectCount, deploymentCount] =
                await Promise.all([
                    PodMember.countDocuments({ collegeId: cid, deletedAt: null }),
                    PodMember.countDocuments({ collegeId: cid, status: 'active', deletedAt: null }),
                    PodProject.countDocuments({ collegeId: cid, deletedAt: null }),
                    Deployment.countDocuments({ collegeId: cid, isVerified: true }),
                ]);

            await College.updateOne(
                { _id: cid },
                { $set: { memberCount, activeMemberCount, projectCount, deploymentCount } }
            );
        }

        // Global summary for fast reads
        const [totalMembers, totalDeployments, totalProjects, totalBadges] =
            await Promise.all([
                PodMember.countDocuments({ status: 'active' }),
                Deployment.countDocuments({ isVerified: true }),
                PodProject.countDocuments({ deletedAt: null }),
                UserBadge.countDocuments(),
            ]);

        console.log(
            `[Cron:Analytics] Refreshed. Members: ${totalMembers}, Deployments: ${totalDeployments}, Projects: ${totalProjects}, Badges: ${totalBadges}`
        );

        return NextResponse.json({
            success: true,
            message: 'Analytics cache refreshed',
            stats: { totalMembers, totalDeployments, totalProjects, totalBadges },
        });
    } catch (error) {
        console.error('[Cron:Analytics] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
