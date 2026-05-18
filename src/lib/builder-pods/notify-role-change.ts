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
}

export interface SendPodMemberInviteEmailParams {
  walletAddress: string;
  memberName: string;
  collegeId: string;
  inviteToken: string;
}

async function resolveMemberEmail(walletAddress: string): Promise<string | null> {
  const podMember = (await PodMember.findOne({
    walletAddress: walletAddress.toLowerCase(),
    deletedAt: null,
  })
    .select("email")
    .lean()) as { email?: string | null } | null;

  let email = podMember?.email ?? null;

  if (!email) {
    const client = await connectDB();
    const userDoc = await client.db().collection("users").findOne({
      address: { $regex: `^${walletAddress}$`, $options: "i" },
    });
    email = userDoc?.emailId ?? null;
  }

  return email;
}

/** Sent after student accepts invite (existing welcome email). */
export async function sendRoleChangeEmail(
  params: NotifyRoleChangeParams,
): Promise<void> {
  const { walletAddress, memberName, role, collegeId } = params;

  try {
    const recipientEmail = await resolveMemberEmail(walletAddress);
    if (!recipientEmail) {
      console.log(`[role-email] No email for ${walletAddress}`);
      return;
    }

    const college = (await College.findById(collegeId).lean()) as {
      name?: string;
      podName?: string;
    } | null;

    await sendMail({
      to: recipientEmail,
      subject: buildRoleChangeSubject(role),
      html: buildRoleChangeEmail({
        memberName,
        roleName: role,
        collegeName: college?.name ?? "Your College",
        podName: college?.podName ?? "Builder Pod",
      }),
    });
  } catch (error) {
    console.error("[role-email] Error:", error);
  }
}

/** Sent when admin selects member — includes Yes / No RSVP links. */
export async function sendPodMemberInviteEmail(
  params: SendPodMemberInviteEmailParams,
): Promise<void> {
  const { walletAddress, memberName, collegeId, inviteToken } = params;

  try {
    const recipientEmail = await resolveMemberEmail(walletAddress);
    if (!recipientEmail) {
      console.log(`[invite-email] No email for ${walletAddress}`);
      return;
    }

    const college = (await College.findById(collegeId).lean()) as {
      name?: string;
      podName?: string;
    } | null;
    const collegeName = college?.name ?? "Your College";
    const podName = college?.podName ?? "Builder Pod";
    const expiryDays = getPodMemberInviteExpiryDays();
    const { yesUrl, noUrl } = buildInviteActionUrls(inviteToken);

    await sendMail({
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
  } catch (error) {
    console.error("[invite-email] Error:", error);
  }
}
