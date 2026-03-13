import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import {
    getAuthContext,
    requireAnyRole,
    UnauthorizedError,
    ForbiddenError,
    verifyCollegeAccess,
} from '@/lib/rbac';
import { MemberManagementSchema } from '@/schemas/builder-pods';
import { recalculateMemberScore, recalculatePodScore } from '@/lib/builder-pods/leaderboard';

// PATCH — assign role to a member or change status (admin only)
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const parsed = MemberManagementSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid member update payload' },
                { status: 400 }
            );
        }
        const { memberId, role, status } = parsed.data;
        const adminWallet = ctx!.walletAddress;

        const member = await PodMember.findById(memberId);
        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Member not found' },
                { status: 404 }
            );
        }

        // Enforce college-scoped access for non-super-admins
        verifyCollegeAccess(ctx!, member.collegeId.toString());

        const oldValues: Record<string, any> = {};
        const newValues: Record<string, any> = {};

        // Role assignment
        if (role) {
            const validRoles = ['pod_lead', 'pod_member', 'faculty_coordinator', 'mentor'];
            if (!validRoles.includes(role)) {
                return NextResponse.json(
                    { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
                    { status: 400 }
                );
            }
            oldValues.role = member.role;
            member.role = role;
            newValues.role = role;

            // ─── SYNC WITH USERROLE (RBAC) ───
            const { UserRole, PlatformRole } = await import('@/models/PlatformRole');
            
            // 1. Revoke existing roles for this wallet + college combination
            await UserRole.updateMany(
                { 
                    walletAddress: member.walletAddress.toLowerCase(),
                    collegeId: member.collegeId,
                    revokedAt: null 
                },
                { revokedAt: new Date() }
            );

            // 2. Grant new role
            const platformRole = await PlatformRole.findOne({ slug: role });
            if (platformRole) {
                await UserRole.create({
                    walletAddress: member.walletAddress.toLowerCase(),
                    roleSlug: role,
                    roleId: platformRole._id,
                    collegeId: member.collegeId,
                    grantedBy: adminWallet,
                });
            }
        }

        // Status change (remove inactive)
        if (status && status !== member.status) {
            oldValues.status = member.status;
            member.status = status;
            member.deletedAt = status === 'removed' ? new Date() : null;
            newValues.status = status;
        }

        if (Object.keys(newValues).length === 0) {
            return NextResponse.json(
                { success: true, member: { _id: member._id, role: member.role, status: member.status }, noChanges: true },
                { status: 200 }
            );
        }

        await member.save();

        if (newValues.status) {
            const wasActive = oldValues.status === 'active';
            const isActive = member.status === 'active';

            if (wasActive !== isActive) {
                await College.updateOne(
                    { _id: member.collegeId },
                    { $inc: { activeMemberCount: isActive ? 1 : -1 } }
                );
            }

            await recalculateMemberScore(member._id);
            await recalculatePodScore(member.collegeId);
        }

        // Notify member
        if (Object.keys(newValues).length > 0) {
            await Notification.create({
                walletAddress: member.walletAddress,
                type: 'role_assigned',
                title: newValues.role
                    ? `Role Updated: ${member.role.replace(/_/g, ' ')}`
                    : `Membership Status: ${member.status}`,
                body: newValues.role
                    ? `Your role has been updated to ${member.role.replace(/_/g, ' ')}.`
                    : `Your Builder Pod membership status is now ${member.status}.`,
                link: '/builder-pods',
            });
        }

        await AuditLog.create({
            actorWallet: adminWallet,
            action: role && status
                ? 'member.manage'
                : role
                    ? 'member.role_assign'
                    : 'member.status_update',
            entityType: 'PodMember',
            entityId: memberId,
            oldValue: oldValues,
            newValue: newValues,
        });

        return NextResponse.json(
            { success: true, member: { _id: member._id, role: member.role, status: member.status } },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Role assignment error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
