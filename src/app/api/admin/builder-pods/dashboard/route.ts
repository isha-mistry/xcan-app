import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { PodMember } from '@/models/PodMember';
import { Deployment } from '@/models/Deployment';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import { AuditLog } from '@/models/AuditLog';
import { College } from '@/models/College';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import {
    getAuthContext, requireAnyRole, isSuperAdmin,
    buildCollegeFilter, getCollegeScope,
    UnauthorizedError, ForbiddenError
} from '@/lib/rbac';

function getCurrentWeekInfo(): { weekNumber: number; year: number } {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return { weekNumber, year: now.getFullYear() };
}

// GET — admin dashboard
// super_admin sees global stats, college_admin/mentor sees scoped stats
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'mentor']);

        await dbConnect();
        const { weekNumber, year } = getCurrentWeekInfo();

        // Build college-scoped filters
        const collegeFilter = buildCollegeFilter(ctx!);
        const scope = getCollegeScope(ctx!);

        const [
            pendingMembers,
            pendingDeployments,
            pendingSubmissions,
            recentAudit,
            podsMissingUpdate,
            totalColleges,
            totalMembers,
        ] = await Promise.all([
            PodMember.countDocuments({ status: 'pending', ...collegeFilter }),
            Deployment.countDocuments({ isVerified: false, ...collegeFilter }),
            ShowcaseSubmission.countDocuments({ status: 'pending', ...collegeFilter }),

            // Audit logs: super_admin sees all, others see only their own actions
            isSuperAdmin(ctx!)
                ? AuditLog.find().sort({ createdAt: -1 }).limit(10).lean()
                : AuditLog.find({ actorWallet: ctx!.walletAddress }).sort({ createdAt: -1 }).limit(10).lean(),

            // Pods missing weekly update — scoped
            College.aggregate([
                {
                    $match: {
                        status: 'active',
                        deletedAt: null,
                        ...(scope ? { _id: { $in: scope.map((id: string) => new mongoose.Types.ObjectId(id)) } } : {}),
                    }
                },
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

            College.countDocuments({ deletedAt: null, ...(scope ? { _id: { $in: scope } } : {}) }),
            PodMember.countDocuments(collegeFilter),
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
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Admin dashboard error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
