import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';

// GET — list pending members
export async function GET() {
    try {
        await dbConnect();

        const pending = await PodMember.find({ status: 'pending' })
            .populate('collegeId', 'name slug')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, members: pending }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pending members:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PATCH — approve or reject a member
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { memberId, action, adminWallet } = body;

        if (!memberId || !action || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'memberId, action, and adminWallet are required' },
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

        if (action === 'approve') {
            member.status = 'active';
            member.approvedBy = adminWallet.toLowerCase();
            member.approvedAt = new Date();
            await member.save();

            // Increment college active member count
            await College.updateOne(
                { _id: member.collegeId },
                { $inc: { activeMemberCount: 1 } }
            );

            // Notify member
            await Notification.create({
                walletAddress: member.walletAddress,
                type: 'member_approved',
                title: 'Pod Membership Approved! 🎉',
                body: 'You are now an active Builder Pod member.',
                link: '/builder-pods',
            });
        } else if (action === 'reject') {
            member.status = 'inactive';
            await member.save();
        } else {
            return NextResponse.json(
                { success: false, error: 'action must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        // Audit log
        await AuditLog.create({
            actorWallet: adminWallet.toLowerCase(),
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
    } catch (error) {
        console.error('Member approval error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
