import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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

// GET — list all showcase submissions (scoped by role)
// super_admin sees all, college_admin/mentor sees their college's
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'mentor']);

        await dbConnect();

        const collegeFilter = buildCollegeFilter(ctx!);

        const pending = await ShowcaseSubmission.find({
            ...collegeFilter,
        })
            .populate('showcaseEventId', 'name eventDate')
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, submissions: pending }, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
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
        const { submissionId, status, placement, isActive, certificateClaimable } = body;
        const adminWallet = ctx!.walletAddress;


        if (!submissionId) {
            return NextResponse.json(
                { success: false, error: 'submissionId is required' },
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

        const oldValue: any = {};
        const newValue: any = {};

        if (status !== undefined) {
            const validStatuses = ['pending', 'approved', 'finalist', 'winner', 'rejected'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { success: false, error: `Status must be: ${validStatuses.join(', ')}` },
                    { status: 400 }
                );
            }
            oldValue.status = submission.status;
            submission.status = status;
            newValue.status = status;
            
            submission.reviewedBy = adminWallet;
            submission.reviewedAt = new Date();
        }

        if (placement !== undefined) {
            oldValue.placement = submission.placement;
            submission.placement = placement;
            newValue.placement = placement;
        }

        if (isActive !== undefined) {
            oldValue.isActive = submission.isActive;
            submission.isActive = isActive;
            newValue.isActive = isActive;
        }

        if (certificateClaimable !== undefined) {
            oldValue.certificateClaimable = submission.certificateClaimable;
            submission.certificateClaimable = Boolean(certificateClaimable);
            newValue.certificateClaimable = submission.certificateClaimable;
            if (submission.certificateClaimable) {
                oldValue.certificateEnabledBy = submission.certificateEnabledBy;
                oldValue.certificateEnabledAt = submission.certificateEnabledAt;
                submission.certificateEnabledBy = adminWallet;
                submission.certificateEnabledAt = new Date();
                newValue.certificateEnabledBy = submission.certificateEnabledBy;
                newValue.certificateEnabledAt = submission.certificateEnabledAt;
            }
        }

        await submission.save();

        await AuditLog.create({
            actorWallet: adminWallet,
            action: `showcase.update`,
            entityType: 'ShowcaseSubmission',
            entityId: submissionId,
            oldValue,
            newValue,
        });

        // Auto-award badges only if status changed to finalist/winner
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

        // Notify if status changed
        if (status) {
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
        }

        // Populate before returning to ensure frontend has all data
        const populatedSubmission = await ShowcaseSubmission.findById(submissionId)
            .populate('showcaseEventId', 'name eventDate')
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .lean();

        return NextResponse.json({ success: true, submission: populatedSubmission }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        console.error('Showcase review error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
