import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import {
    buildCollegeFilter,
    getAuthContext,
    requireAnyRole,
    UnauthorizedError,
    ForbiddenError,
    verifyCollegeAccess,
} from '@/lib/rbac';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';
import { recalculateMemberScore, recalculatePodScore } from '@/lib/builder-pods/leaderboard';
import { MemberApprovalSchema } from '@/schemas/builder-pods';

// GET — list pending members (admin only)
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get('status') || 'pending';
        const validStatuses = ['pending', 'active', 'inactive', 'removed'];
        const requestedStatuses = statusParam
            .split(',')
            .map((status) => status.trim())
            .filter((status) => validStatuses.includes(status));

        const filter: Record<string, any> = {};
        if (requestedStatuses.length === 1) {
            filter.status = requestedStatuses[0];
        } else if (requestedStatuses.length > 1) {
            filter.status = { $in: requestedStatuses };
        }

        const collegeScopeFilter = buildCollegeFilter(ctx!, 'collegeId');

        const members = await PodMember.find({ ...filter, ...collegeScopeFilter })
            .populate('collegeId', 'name slug')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, members }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Error fetching pending members:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH — approve or reject a member (admin only)
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const parsed = MemberApprovalSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid member approval payload' },
                { status: 400 }
            );
        }
        const { memberId, action } = parsed.data;
        const adminWallet = ctx!.walletAddress; // taken from verified JWT, not body

        const member = await PodMember.findById(memberId);
        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Member not found' },
                { status: 404 }
            );
        }

        const oldStatus = member.status;

        // Enforce college-scoped access for non-super-admins
        verifyCollegeAccess(ctx!, member.collegeId.toString());

        if (action === 'approve') {
            member.status = 'active';
            member.approvedBy = adminWallet;
            member.approvedAt = new Date();
            await member.save();

            // Increment college active member count
            if (oldStatus !== 'active') {
                await College.updateOne(
                    { _id: member.collegeId },
                    { $inc: { activeMemberCount: 1 } }
                );
            }

            // Auto-award "builder_pod_member" badge on approval
            await awardBadgeOnEvent('pod_member_approved', member.walletAddress, {
                collegeId: member.collegeId?.toString(),
            });

            // Notify member
            await Notification.create({
                walletAddress: member.walletAddress,
                type: 'member_approved',
                title: 'Pod Membership Approved! 🎉',
                body: 'You are now an active Builder Pod member.',
                link: '/builder-pods',
            });

            // Inline leaderboard update
            await recalculateMemberScore(member._id);
            await recalculatePodScore(member.collegeId);
        } else if (action === 'reject') {
            member.status = 'inactive';
            await member.save();
        } else {
            return NextResponse.json(
                { success: false, error: 'action must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        // Audit log — actor wallet comes from JWT, not request body
        await AuditLog.create({
            actorWallet: adminWallet,
            action: `member.${action}`,
            entityType: 'PodMember',
            entityId: memberId,
            oldValue: { status: oldStatus },
            newValue: { status: member.status },
        });

        return NextResponse.json(
            { success: true, member: { _id: member._id, status: member.status } },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Member approval error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
