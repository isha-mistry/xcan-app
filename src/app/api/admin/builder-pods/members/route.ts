import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { getAuthContext, requireRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';

// GET — list all members with optional filters (admin only)
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const filter: Record<string, any> = { deletedAt: null };
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { name: regex },
                { walletAddress: regex },
                { githubUsername: regex },
            ];
        }

        const members = await PodMember.find(filter)
            .populate('collegeId', 'name slug')
            .sort({ createdAt: -1 })
            .lean();

        const statusCounts = await PodMember.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const counts: Record<string, number> = { all: 0 };
        for (const s of statusCounts) {
            counts[s._id] = s.count;
            counts.all += s.count;
        }

        return NextResponse.json({ success: true, members, counts }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Error fetching members:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH — approve or reject a member (admin only)
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();
        const body = await req.json();
        const { memberId, action } = body;
        const adminWallet = ctx!.walletAddress; // taken from verified JWT, not body

        if (!memberId || !action) {
            return NextResponse.json(
                { success: false, error: 'memberId and action are required' },
                { status: 400 }
            );
        }

        const member = await PodMember.findById(memberId);
        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Member not found' },
                { status: 404 }
            );
        }

        const oldStatus = member.status;

        if (action === 'approve' || action === 'activate') {
            member.status = 'active';
            if (action === 'approve') {
                member.approvedBy = adminWallet;
                member.approvedAt = new Date();
            }
            await member.save();

            // Increment college active member count only if transitioning from non-active
            if (oldStatus !== 'active') {
                await College.updateOne(
                    { _id: member.collegeId },
                    { $inc: { activeMemberCount: 1 } }
                );
            }

            if (action === 'approve') {
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
            }
        } else if (action === 'reject') {
            member.status = 'removed';
            await member.save();
        } else if (action === 'deactivate') {
            member.status = 'inactive';
            await member.save();

            // Decrement active count if moving away from active
            if (oldStatus === 'active') {
                await College.updateOne(
                    { _id: member.collegeId },
                    { $inc: { activeMemberCount: -1 } }
                );
            }
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
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
