import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { getAuthContext, UnauthorizedError } from '@/lib/rbac';
import { z } from 'zod';

const RequestRoleSchema = z.object({
    collegeSlug: z.string().min(2).max(100),
    requestedRole: z.enum(['pod_member', 'pod_lead']),
});

export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();

        const parsed = RequestRoleSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid request payload' },
                { status: 400 }
            );
        }

        const { collegeSlug, requestedRole } = parsed.data;
        const walletAddress = ctx.walletAddress;

        const college = await College.findOne({ slug: collegeSlug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const member = await PodMember.findOne({
            collegeId: college._id,
            walletAddress,
            deletedAt: null,
        });

        if (!member) {
            return NextResponse.json(
                { success: false, error: 'You must be a registered member of this pod first' },
                { status: 403 }
            );
        }

        if (member.status !== 'active') {
            return NextResponse.json(
                { success: false, error: 'Your membership must be approved before requesting a role upgrade' },
                { status: 403 }
            );
        }

        const roleHierarchy = ['pod_participant', 'pod_member', 'pod_lead'];
        const currentIdx = roleHierarchy.indexOf(member.role);
        const requestedIdx = roleHierarchy.indexOf(requestedRole);

        if (currentIdx >= requestedIdx) {
            return NextResponse.json(
                { success: false, error: `You already have the ${member.role} role or higher` },
                { status: 409 }
            );
        }

        if (member.requestedRole) {
            return NextResponse.json(
                { success: false, error: 'You already have a pending role request' },
                { status: 409 }
            );
        }

        member.requestedRole = requestedRole;
        await member.save();

        await AuditLog.create({
            actorWallet: walletAddress,
            action: 'member.request_role',
            entityType: 'PodMember',
            entityId: member._id.toString(),
            newValue: { requestedRole },
        });

        return NextResponse.json(
            { success: true, message: 'Role request submitted. An admin will review your request.' },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }
        console.error('Role request error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
