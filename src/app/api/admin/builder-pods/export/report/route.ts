import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getAuthContext, requireRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { PodProject } from '@/models/PodProject';
import { Deployment } from '@/models/Deployment';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { ShowcaseEvent } from '@/models/ShowcaseEvent';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import { ProgramMilestone } from '@/models/ProgramMilestone';

// GET /api/admin/builder-pods/export/report — DAO report data export
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();

        const [
            colleges,
            membersByStatus,
            projectsByStatus,
            deploymentStats,
            weeklyUpdates,
            showcaseEvents,
            showcaseSubmissions,
            milestones,
        ] = await Promise.all([
            College.find({ deletedAt: null })
                .select('name slug city state regionSnapshot status memberCount activeMemberCount projectCount deploymentCount batchYear activatedAt')
                .sort({ name: 1 })
                .lean(),
            PodMember.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            PodProject.aggregate([
                { $match: { deletedAt: null } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Deployment.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
                        uniqueDeployers: { $addToSet: '$walletAddress' },
                    },
                },
                {
                    $project: {
                        total: 1,
                        verified: 1,
                        uniqueDeployers: { $size: '$uniqueDeployers' },
                    },
                },
            ]),
            WeeklyUpdate.countDocuments(),
            ShowcaseEvent.find().select('name city status eventDate prizePoolUsd regionSnapshot').lean(),
            ShowcaseSubmission.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            ProgramMilestone.find().sort({ milestoneNumber: 1 }).lean(),
        ]);

        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalColleges: colleges.length,
                activeColleges: colleges.filter((c: any) => c.status === 'active').length,
                members: Object.fromEntries(membersByStatus.map((m: any) => [m._id, m.count])),
                projects: Object.fromEntries(projectsByStatus.map((p: any) => [p._id, p.count])),
                deployments: deploymentStats[0] ?? { total: 0, verified: 0, uniqueDeployers: 0 },
                weeklyUpdates,
                showcaseEvents: showcaseEvents.length,
                showcaseSubmissions: Object.fromEntries(showcaseSubmissions.map((s: any) => [s._id, s.count])),
            },
            colleges,
            showcaseEvents,
            milestones,
        };

        return NextResponse.json({ success: true, report }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('DAO report export error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
