import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { AuditLog } from '@/models/AuditLog';
import {
    getAuthContext,
    requireAnyRole,
    verifyCollegeAccess,
    hasRole,
    hasAnyRole,
    UnauthorizedError,
    ForbiddenError,
} from '@/lib/rbac';

// PATCH — edit an existing weekly update for a pod
// Allowed:
// - pod_lead who originally submitted the update (for this college)
// - college_admin / super_admin for this college
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; id: string }> }
) {
    try {
        const ctx = await getAuthContext(req);
        await dbConnect();
        const { slug, id } = await params;
        const body = await req.json();
        const { completedThisWeek, blockers, nextMilestone, githubLink } = body;

        const college = await College.findOne({ slug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        // Verify college-scoped access with correct roles
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'pod_lead'], college._id.toString());

        const existing = await WeeklyUpdate.findOne({
            _id: id,
            collegeId: college._id,
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Weekly update not found' },
                { status: 404 }
            );
        }

        const walletAddress = ctx!.walletAddress;

        // Double check specific edit permissions
        const isCollegeAdmin = hasAnyRole(ctx!, ['super_admin', 'college_admin'], college._id.toString());
        const isSubmittingPodLead =
            existing.submittedBy === walletAddress.toLowerCase() &&
            hasRole(ctx!, 'pod_lead', college._id.toString());

        if (!isCollegeAdmin && !isSubmittingPodLead) {
            throw new ForbiddenError('Only the pod lead who submitted this or college admin can edit this update');
        }

        const oldValue = {
            completedThisWeek: existing.completedThisWeek,
            blockers: existing.blockers,
            nextMilestone: existing.nextMilestone,
            githubLink: existing.githubLink,
        };

        if (completedThisWeek !== undefined) existing.completedThisWeek = completedThisWeek;
        if (blockers !== undefined) existing.blockers = blockers || null;
        if (nextMilestone !== undefined) existing.nextMilestone = nextMilestone;
        if (githubLink !== undefined) existing.githubLink = githubLink || null;

        await existing.save();

        await AuditLog.create({
            actorWallet: walletAddress,
            action: 'weekly_update.edit',
            entityType: 'WeeklyUpdate',
            entityId: existing._id.toString(),
            oldValue,
            newValue: {
                completedThisWeek: existing.completedThisWeek,
                blockers: existing.blockers,
                nextMilestone: existing.nextMilestone,
                githubLink: existing.githubLink,
            },
            ipAddress: req.headers.get('x-forwarded-for') || req.ip || null,
        });

        return NextResponse.json(
            {
                success: true,
                update: {
                    _id: existing._id,
                    completedThisWeek: existing.completedThisWeek,
                    blockers: existing.blockers,
                    nextMilestone: existing.nextMilestone,
                    githubLink: existing.githubLink,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError)
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError)
            return NextResponse.json({ success: false, error: error.message }, { status: 403 });

        console.error('Weekly update edit error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

