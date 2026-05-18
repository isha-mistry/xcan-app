/**
 * Pod Member invite + RSVP (Yes / No).
 *
 * Flow:
 *  1. Admin selects member for Pod Member → invite email (role stays lab_participant).
 *  2. Student clicks Yes → role, RBAC, badge, welcome email (existing flow).
 *  3. Student clicks No → invite declined, role unchanged.
 */

import { PodMember, POD_MEMBER_INVITE_STATUS, type IPodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';
import { sendRoleChangeEmail, sendPodMemberInviteEmail } from '@/lib/builder-pods/notify-role-change';
import {
    generateInviteToken,
    hashInviteToken,
    getInviteExpiryDate,
    verifyInviteToken,
} from '@/lib/builder-pods/pod-member-invite/token';

export type InviteLookupResult =
    | { ok: true; member: IPodMember; collegeName: string; podName: string }
    | { ok: false; reason: 'invalid' | 'expired' | 'already_answered' };

export function clearPodMemberInvite(member: IPodMember): void {
    member.podMemberInviteStatus = null;
    member.podMemberInviteTokenHash = null;
    member.podMemberInviteExpiresAt = null;
    member.podMemberInvitedBy = null;
}

async function grantPodMemberPlatformRole(member: IPodMember, grantedBy: string | null): Promise<void> {
    const { UserRole, PlatformRole } = await import('@/models/PlatformRole');

    await UserRole.updateMany(
        {
            walletAddress: member.walletAddress.toLowerCase(),
            collegeId: member.collegeId,
            roleSlug: { $ne: 'pod_member' },
            revokedAt: null,
        },
        { revokedAt: new Date() },
    );

    const platformRole = await PlatformRole.findOne({ slug: 'pod_member' });
    if (platformRole) {
        await UserRole.findOneAndUpdate(
            {
                walletAddress: member.walletAddress.toLowerCase(),
                roleSlug: 'pod_member',
                collegeId: member.collegeId,
            },
            {
                $set: {
                    revokedAt: null,
                    roleId: platformRole._id,
                    grantedBy: grantedBy ?? member.podMemberInvitedBy,
                },
            },
            { upsert: true },
        );
    }
}

/** Existing pod_member promotion side effects (role, RBAC, badge, notifications). */
export async function completePodMemberPromotion(member: IPodMember): Promise<void> {
    const oldRole = member.role;
    member.role = 'pod_member';
    await member.save();

    await grantPodMemberPlatformRole(member, member.podMemberInvitedBy);

    await awardBadgeOnEvent('pod_member_approved', member.walletAddress, {
        collegeId: member.collegeId.toString(),
    });

    await Notification.create({
        walletAddress: member.walletAddress,
        type: 'role_assigned',
        title: 'You are now a Pod Member! 🎉',
        body: 'You confirmed your spot. Your Pod Member badge will appear once on-chain attestation completes.',
        link: '/builder-pods',
    });

    sendRoleChangeEmail({
        walletAddress: member.walletAddress,
        memberName: member.name,
        role: 'pod_member',
        collegeId: member.collegeId.toString(),
    }).catch(() => {});

    await AuditLog.create({
        actorWallet: member.walletAddress,
        action: 'member.pod_member_invite_accepted',
        entityType: 'PodMember',
        entityId: member._id,
        oldValue: { role: oldRole, podMemberInviteStatus: 'pending' },
        newValue: { role: 'pod_member', podMemberInviteStatus: 'accepted' },
    });
}

export async function findMemberByInviteToken(token: string): Promise<InviteLookupResult> {
    const hash = hashInviteToken(token);
    // Token hash field uses `select: false` — must opt in or verification always fails.
    const member = await PodMember.findOne({
        podMemberInviteTokenHash: hash,
        deletedAt: null,
    }).select('+podMemberInviteTokenHash');

    if (!member || !verifyInviteToken(token, member.podMemberInviteTokenHash)) {
        return { ok: false, reason: 'invalid' };
    }

    if (member.podMemberInviteStatus !== 'pending') {
        return { ok: false, reason: 'already_answered' };
    }

    if (member.podMemberInviteExpiresAt && member.podMemberInviteExpiresAt < new Date()) {
        return { ok: false, reason: 'expired' };
    }

    const college = await College.findById(member.collegeId).lean() as {
        name?: string;
        podName?: string;
    } | null;

    return {
        ok: true,
        member,
        collegeName: college?.name ?? 'Your College',
        podName: college?.podName ?? 'Builder Pod',
    };
}

/**
 * Admin action: send invite email. Does not assign pod_member role or badge.
 */
export async function sendPodMemberInvite(
    member: IPodMember,
    adminWallet: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    if (member.status !== 'active') {
        return { ok: false, error: 'Member must be active before Pod Member selection.' };
    }
    if (member.role === 'pod_member') {
        return { ok: false, error: 'Member is already a Pod Member.' };
    }
    if (member.podMemberInviteStatus === 'pending') {
        return { ok: false, error: 'An invite is already pending. Wait for RSVP or cancel by changing role.' };
    }

    const rawToken = generateInviteToken();
    member.podMemberInviteStatus = 'pending';
    member.podMemberInviteTokenHash = hashInviteToken(rawToken);
    member.podMemberInviteExpiresAt = getInviteExpiryDate();
    member.podMemberInviteRespondedAt = null;
    member.podMemberInvitedBy = adminWallet.toLowerCase();
    member.requestedRole = null;

    await member.save();

    await Notification.create({
        walletAddress: member.walletAddress,
        type: 'role_assigned',
        title: 'Pod Member invitation',
        body: 'You were selected as a Pod Member. Check your email and confirm with Yes or No.',
        link: '/builder-pods',
    });

    sendPodMemberInviteEmail({
        walletAddress: member.walletAddress,
        memberName: member.name,
        collegeId: member.collegeId.toString(),
        inviteToken: rawToken,
    }).catch(() => {});

    await AuditLog.create({
        actorWallet: adminWallet.toLowerCase(),
        action: 'member.pod_member_invite_sent',
        entityType: 'PodMember',
        entityId: member._id,
        oldValue: { role: member.role },
        newValue: { podMemberInviteStatus: 'pending' },
    });

    return { ok: true };
}

export async function acceptPodMemberInvite(member: IPodMember): Promise<void> {
    member.podMemberInviteStatus = 'accepted';
    member.podMemberInviteRespondedAt = new Date();
    member.podMemberInviteTokenHash = null;
    member.podMemberInviteExpiresAt = null;

    await completePodMemberPromotion(member);
}

export async function declinePodMemberInvite(member: IPodMember): Promise<void> {
    member.podMemberInviteStatus = 'declined';
    member.podMemberInviteRespondedAt = new Date();
    member.podMemberInviteTokenHash = null;
    member.podMemberInviteExpiresAt = null;

    await member.save();

    await Notification.create({
        walletAddress: member.walletAddress,
        type: 'role_assigned',
        title: 'Pod Member invitation declined',
        body: 'You declined the Pod Member invitation.',
        link: '/builder-pods',
    });

    if (member.podMemberInvitedBy) {
        await Notification.create({
            walletAddress: member.podMemberInvitedBy,
            type: 'role_assigned',
            title: 'Pod Member invite declined',
            body: `${member.name} declined the Pod Member invitation.`,
            link: '/admin/builder-pods/members',
        });
    }

    await AuditLog.create({
        actorWallet: member.walletAddress,
        action: 'member.pod_member_invite_declined',
        entityType: 'PodMember',
        entityId: member._id,
        oldValue: { podMemberInviteStatus: 'pending' },
        newValue: { podMemberInviteStatus: 'declined' },
    });
}

export { POD_MEMBER_INVITE_STATUS };
