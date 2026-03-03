import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';

// PATCH — assign role to a member or remove inactive member
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { memberId, role, status, adminWallet } = body;

        if (!memberId || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'memberId and adminWallet are required' },
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
            const validRoles = ['tech_lead', 'team_member', 'mentor'];
            if (!validRoles.includes(role)) {
                return NextResponse.json(
                    { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
                    { status: 400 }
                );
            }
            oldValues.role = member.role;
            member.role = role;
            newValues.role = role;
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
            actorWallet: adminWallet.toLowerCase(),
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
    } catch (error) {
        console.error('Role assignment error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
