/**
 * Builder Pods — Send email & in-app notification when a member's role
 * changes to pod_lead or pod_member.
 *
 * This helper:
 *   1. Uses the member's email from PodMember (stored at registration).
 *   2. Falls back to the `users` collection (via walletAddress) if not set.
 *   3. Fetches the college / pod name for context.
 *   4. Sends a branded HTML email via nodemailer (non-blocking; failures are logged).
 */

import { connectDB } from '@/config/connectDB';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { sendMail } from '@/lib/mailer';
import {
    buildRoleChangeEmail,
    buildRoleChangeSubject,
} from '@/lib/builder-pods/email-templates';

interface NotifyRoleChangeParams {
    walletAddress: string;
    memberName: string;
    role: 'pod_lead' | 'pod_member';
    collegeId: string;
}

/**
 * Send an email notification for a builder-pod role change.
 * This is fire-and-forget — errors are logged but never thrown.
 */
export async function sendRoleChangeEmail(params: NotifyRoleChangeParams): Promise<void> {
    const { walletAddress, memberName, role, collegeId } = params;

    try {
        // ── 1. Try to get email from PodMember record first ─────────────
        const podMember = await PodMember.findOne({
            walletAddress: walletAddress.toLowerCase(),
            deletedAt: null,
        }).select('email').lean() as { email?: string | null } | null;

        let recipientEmail: string | null = podMember?.email ?? null;

        // ── 2. Fallback: fetch from legacy `users` collection ───────────
        if (!recipientEmail) {
            const client = await connectDB();
            const db = client.db();
            const usersCollection = db.collection('users');

            const userDoc = await usersCollection.findOne({
                address: { $regex: `^${walletAddress}$`, $options: 'i' },
            });

            recipientEmail = userDoc?.emailId ?? null;
        }

        if (!recipientEmail) {
            console.log(`[role-email] No email found for wallet ${walletAddress} — skipping email.`);
            return;
        }

        // ── 3. Fetch college & pod details ──────────────────────────────
        const college = await College.findById(collegeId).lean() as any;
        const collegeName = college?.name ?? 'Your College';
        const podName = college?.podName ?? 'Builder Pod';

        // ── 4. Build & send the email ───────────────────────────────────
        const subject = buildRoleChangeSubject(role);
        const html = buildRoleChangeEmail({
            memberName,
            roleName: role,
            collegeName,
            podName,
        });

        await sendMail({ to: recipientEmail, subject, html });
    } catch (error) {
        // Never let email failures propagate to the caller
        console.error('[role-email] Error sending role-change email:', error);
    }
}
