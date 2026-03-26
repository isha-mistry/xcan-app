import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { getAuthContext, UnauthorizedError } from '@/lib/rbac';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { handleApiError, validationError } from '@/lib/api-response';

const RequestRoleSchema = z.object({
    collegeSlug: z.string().min(2).max(100),
    requestedRole: z.enum(['pod_member', 'pod_lead']),
});

export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        const rateCheck = checkRateLimit(`role-request:${ctx.walletAddress}`, 3, 60_000);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { success: false, error: 'Too many role requests. Please try again later.' },
                { status: 429 }
            );
        }

        await dbConnect();

        const parsed = RequestRoleSchema.safeParse(await req.json());
        if (!parsed.success) {
            return validationError(parsed.error);
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
    } catch (error: unknown) {
        return handleApiError(error, 'Role request error');
    }
}
