import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';

// GET — list pending showcase submissions
export async function GET() {
    try {
        await dbConnect();
        const pending = await ShowcaseSubmission.find({ status: { $in: ['pending', 'finalist'] } })
            .populate('showcaseEventId', 'name eventDate')
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, submissions: pending }, { status: 200 });
    } catch (error) {
        console.error('Admin showcases error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PATCH — approve, mark finalist, or mark winner
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { submissionId, status, placement, adminWallet } = body;

        if (!submissionId || !status || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'submissionId, status, and adminWallet are required' },
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

        const oldStatus = submission.status;
        submission.status = status;
        submission.reviewedBy = adminWallet.toLowerCase();
        submission.reviewedAt = new Date();

        if (placement) {
            submission.placement = placement;
        }

        await submission.save();

        // Award badges for finalist / winner
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
            actorWallet: adminWallet.toLowerCase(),
            action: `showcase.${status}`,
            entityType: 'ShowcaseSubmission',
            entityId: submissionId,
            oldValue: { status: oldStatus },
            newValue: { status, placement },
        });

        return NextResponse.json({ success: true, status }, { status: 200 });
    } catch (error) {
        console.error('Showcase review error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
