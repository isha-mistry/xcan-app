import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { Deployment } from '@/models/Deployment';
import { PodProject } from '@/models/PodProject';
import { UserBadge } from '@/models/UserBadge';
import { BadgeType } from '@/models/BadgeType';

export async function GET() {
    try {
        await dbConnect();

        const [collegeStats, memberStats, deploymentCount, projectStats, badgeCount] =
            await Promise.all([
                College.aggregate([
                    { $match: { deletedAt: null } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                        },
                    },
                ]),

                PodMember.aggregate([
                    { $match: { deletedAt: null } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                        },
                    },
                ]),

                Deployment.countDocuments({ isVerified: true }),

                PodProject.aggregate([
                    { $match: { deletedAt: null } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            inProgress: { $sum: { $cond: [{ $ne: ['$status', 'demo_ready'] }, 1, 0] } },
                        },
                    },
                ]),

                (async () => {
                    const podBadgeSlugs = await BadgeType.find({ category: 'builder_pods' }).distinct('slug');
                    return UserBadge.countDocuments({ 'badgeSnapshot.slug': { $in: podBadgeSlugs } });
                })(),
            ]);

        const members = memberStats[0] ?? { total: 0, active: 0 };
        const colleges = collegeStats[0] ?? { total: 0, active: 0 };

        return NextResponse.json({
            success: true,
            summary: {
                collegesActivated: colleges.active,
                totalColleges: colleges.total,
                studentsRegistered: members.total,
                activePodMembers: members.active,
                activePodMembersPercent: members.total > 0
                    ? Math.round((members.active / members.total) * 100)
                    : 0,
                totalProjects: projectStats[0]?.total ?? 0,
                projectsInProgress: projectStats[0]?.inProgress ?? 0,
                contractsDeployed: deploymentCount,
                badgesIssued: badgeCount,
            },
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
