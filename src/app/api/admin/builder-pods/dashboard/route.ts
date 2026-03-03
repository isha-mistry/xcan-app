import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { Deployment } from '@/models/Deployment';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import { AuditLog } from '@/models/AuditLog';
import { College } from '@/models/College';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';

function getCurrentWeekInfo(): { weekNumber: number; year: number } {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return { weekNumber, year: now.getFullYear() };
}

export async function GET() {
    try {
        await dbConnect();
        const { weekNumber, year } = getCurrentWeekInfo();

        const [
            pendingMembers,
            pendingDeployments,
            pendingSubmissions,
            recentAudit,
            podsMissingUpdate,
            totalColleges,
            totalMembers,
        ] = await Promise.all([
            PodMember.countDocuments({ status: 'pending' }),
            Deployment.countDocuments({ isVerified: false }),
            ShowcaseSubmission.countDocuments({ status: 'pending' }),

            AuditLog.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),

            College.aggregate([
                { $match: { status: 'active', deletedAt: null } },
                {
                    $lookup: {
                        from: 'weeklyupdates',
                        let: { cid: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$collegeId', '$$cid'] },
                                            { $eq: ['$weekNumber', weekNumber] },
                                            { $eq: ['$year', year] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'thisWeekUpdate',
                    },
                },
                { $match: { thisWeekUpdate: { $size: 0 } } },
                { $project: { name: 1, slug: 1 } },
            ]),

            College.countDocuments({ deletedAt: null }),
            PodMember.countDocuments(),
        ]);

        return NextResponse.json({
            success: true,
            dashboard: {
                pendingMembers,
                pendingDeployments,
                pendingSubmissions,
                totalColleges,
                totalMembers,
                recentAudit,
                weeklyUpdatesMissing: {
                    count: podsMissingUpdate.length,
                    pods: podsMissingUpdate,
                },
            },
        }, { status: 200 });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
