/**
 * Builder Pods — role-change emails and Pod Member invite (RSVP) emails.
 */

import { connectDB } from "@/config/connectDB";
import { PodMember } from "@/models/PodMember";
import { College } from "@/models/College";
import { sendMail } from "@/lib/mailer";
import {
  buildRoleChangeEmail,
  buildRoleChangeSubject,
  buildPodMemberInviteEmail,
  buildPodMemberInviteSubject,
} from "@/lib/builder-pods/email-templates";
import {
  buildInviteActionUrls,
  getPodMemberInviteExpiryDays,
} from "@/lib/builder-pods/pod-member-invite/token";

interface NotifyRoleChangeParams {
  walletAddress: string;
  memberName: string;
  role: "pod_lead" | "pod_member";
  collegeId: string;
  /** Use the PodMember row that accepted RSVP (avoids wrong college / missing email). */
  memberEmail?: string | null;
}

export interface SendPodMemberInviteEmailParams {
  walletAddress: string;
  memberName: string;
  collegeId: string;
  inviteToken: string;
  memberEmail?: string | null;
}

export type RoleEmailResult =
  | { sent: true; to: string }
  | { sent: false; reason: string };

async function resolveMemberEmail(
  walletAddress: string,
  collegeId?: string,
  preferredEmail?: string | null,
): Promise<string | null> {
  const trimmed = preferredEmail?.trim();
  if (trimmed) return trimmed;

  const baseQuery: Record<string, unknown> = {
    walletAddress: walletAddress.toLowerCase(),
    deletedAt: null,
  };

  if (collegeId) {
    const forCollege = (await PodMember.findOne({
      ...baseQuery,
      collegeId,
    })
      .select("email")
      .lean()) as { email?: string | null } | null;
    if (forCollege?.email?.trim()) return forCollege.email.trim();
  }

  const members = (await PodMember.find(baseQuery).select("email").lean()) as {
    email?: string | null;
  }[];
  const fromAnyMember = members.find((m) => m.email?.trim())?.email?.trim();
  if (fromAnyMember) return fromAnyMember;

  try {
    const client = await connectDB();
    const userDoc = await client.db().collection("users").findOne({
      address: { $regex: `^${walletAddress}$`, $options: "i" },
    });
    const fromUser = userDoc?.emailId?.trim();
    if (fromUser) return fromUser;
  } catch (err) {
    console.error("[role-email] users collection lookup failed:", err);
  }

  return null;
}

/** Sent after student accepts invite (Pod Member welcome email). */
export async function sendRoleChangeEmail(
  params: NotifyRoleChangeParams,
): Promise<RoleEmailResult> {
  const { walletAddress, memberName, role, collegeId, memberEmail } = params;

  try {
    const recipientEmail = await resolveMemberEmail(
      walletAddress,
      collegeId,
      memberEmail,
    );
    if (!recipientEmail) {
      console.warn(
        `[role-email] No email for ${walletAddress} (collegeId=${collegeId})`,
      );
      return { sent: false, reason: "no_recipient_email" };
    }

    const college = (await College.findById(collegeId).lean()) as {
      name?: string;
      podName?: string;
    } | null;

    const ok = await sendMail({
      to: recipientEmail,
      subject: buildRoleChangeSubject(role),
      html: buildRoleChangeEmail({
        memberName,
        roleName: role,
        collegeName: college?.name ?? "Your College",
        podName: college?.podName ?? "Builder Pod",
      }),
    });

    if (!ok) {
      return { sent: false, reason: "smtp_send_failed" };
    }
    return { sent: true, to: recipientEmail };
  } catch (error) {
    console.error("[role-email] Error:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "unknown_error",
    };
  }
}

/** Sent when admin selects member — includes Yes / No RSVP links. */
export async function sendPodMemberInviteEmail(
  params: SendPodMemberInviteEmailParams,
): Promise<RoleEmailResult> {
  const { walletAddress, memberName, collegeId, inviteToken, memberEmail } =
    params;

  try {
    const recipientEmail = await resolveMemberEmail(
      walletAddress,
      collegeId,
      memberEmail,
    );
    if (!recipientEmail) {
      console.warn(
        `[invite-email] No email for ${walletAddress} (collegeId=${collegeId})`,
      );
      return { sent: false, reason: "no_recipient_email" };
    }

    const college = (await College.findById(collegeId).lean()) as {
      name?: string;
      podName?: string;
    } | null;
    const collegeName = college?.name ?? "Your College";
    const podName = college?.podName ?? "Builder Pod";
    const expiryDays = getPodMemberInviteExpiryDays();
    const { yesUrl, noUrl } = buildInviteActionUrls(inviteToken);

    const ok = await sendMail({
      to: recipientEmail,
      subject: buildPodMemberInviteSubject(podName),
      html: buildPodMemberInviteEmail({
        memberName,
        collegeName,
        podName,
        yesUrl,
        noUrl,
        expiryDays,
      }),
    });

    if (!ok) {
      return { sent: false, reason: "smtp_send_failed" };
    }
    return { sent: true, to: recipientEmail };
  } catch (error) {
    console.error("[invite-email] Error:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
