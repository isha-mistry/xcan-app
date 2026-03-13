import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { getAuthContext, requireRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';

// PATCH — assign role to a member or change status (admin only)
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();
        const body = await req.json();
        const { memberId, role, status } = body;
        const adminWallet = ctx!.walletAddress;

        if (!memberId) {
            return NextResponse.json(
                { success: false, error: 'memberId is required' },
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
        if (status) {
            const validStatuses = ['active', 'inactive', 'pending'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                    { status: 400 }
                );
            }
            oldValues.status = member.status;
            member.status = status;
            newValues.status = status;
        }

        await member.save();

        // Notify member
        if (role) {
            await Notification.create({
                walletAddress: member.walletAddress,
                type: 'role_assigned',
                title: `Role Updated: ${role.replace(/_/g, ' ')}`,
                body: `Your role has been updated to ${role.replace(/_/g, ' ')}.`,
                link: '/builder-pods',
            });
        }

        await AuditLog.create({
            actorWallet: adminWallet,
            action: role ? 'member.role_assign' : 'member.status_update',
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
