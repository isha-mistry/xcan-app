import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';
import {
    getAuthContext, requireAnyRole,
    buildCollegeFilter, verifyCollegeAccess,
    UnauthorizedError, ForbiddenError
} from '@/lib/rbac';

// GET — list pending showcase submissions
// super_admin sees all, college_admin/mentor sees their college's
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'mentor']);

        await dbConnect();

        const collegeFilter = buildCollegeFilter(ctx!);

        const pending = await ShowcaseSubmission.find({
            status: { $in: ['pending', 'finalist'] },
            ...collegeFilter,
        })
            .populate('showcaseEventId', 'name eventDate')
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, submissions: pending }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Admin showcases error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH — approve, mark finalist, or mark winner
// super_admin can for any, college_admin/mentor for their college's
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'mentor']);

        await dbConnect();
        const body = await req.json();
        const { submissionId, status, placement } = body;
        const adminWallet = ctx!.walletAddress;

        if (!submissionId || !status) {
            return NextResponse.json(
                { success: false, error: 'submissionId and status are required' },
                { status: 400 }
            );
        }

        const validStatuses = ['approved', 'finalist', 'winner', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Status must be: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        const submission = await ShowcaseSubmission.findById(submissionId);
        if (!submission) {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        // Verify college-scoped access
        verifyCollegeAccess(ctx!, submission.collegeId.toString());

        const oldStatus = submission.status;
        submission.status = status;
        submission.reviewedBy = adminWallet;
        submission.reviewedAt = new Date();

        if (placement) {
            submission.placement = placement;
        }

        await submission.save();

        // Auto-award badges for finalist / winner
        if (status === 'finalist') {
            await awardBadgeOnEvent('showcase_finalist', submission.submittedBy, {
                collegeId: submission.collegeId?.toString(),
                showcaseEventId: submission.showcaseEventId?.toString(),
            });
        }
        if (status === 'winner') {
            await awardBadgeOnEvent('showcase_winner', submission.submittedBy, {
                collegeId: submission.collegeId?.toString(),
                showcaseEventId: submission.showcaseEventId?.toString(),
            });
        }

        // Notify
        await Notification.create({
            walletAddress: submission.submittedBy,
            type: status === 'winner' ? 'showcase_winner' : 'showcase_finalist',
            title: status === 'winner'
                ? 'Showcase Winner! 🏆'
                : status === 'finalist'
                    ? 'Showcase Finalist! 🎉'
                    : `Submission ${status}`,
            body: `Your showcase submission has been marked as ${status}.`,
            link: '/builder-pods',
        });

        await AuditLog.create({
            actorWallet: adminWallet,
            action: `showcase.${status}`,
            entityType: 'ShowcaseSubmission',
            entityId: submissionId,
            oldValue: { status: oldStatus },
            newValue: { status, placement },
        });

        return NextResponse.json({ success: true, status }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        console.error('Showcase review error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
