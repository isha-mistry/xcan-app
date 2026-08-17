/**
 * Builder Pods — Role assignment email template.
 * High-end, production-level UI with refined light theme.
 */

const PLATFORM_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.xcan.dev";
const SLACK_URL = process.env.BUILDER_POD_SLACK_URL || "";
const NOTION_URL =
  process.env.BUILDER_POD_NOTION_URL ||
  "https://lamprosdao.notion.site/arbitrum-builder-pods";

interface RoleChangeEmailData {
  memberName: string;
  roleName: "pod_lead" | "pod_member";
  collegeName: string;
  podName: string;
}

const getRoleLabel = (role: string) =>
  role === "pod_lead" ? "Pod Lead" : "Pod Member";

const getRoleDescription = (role: string) =>
  role === "pod_lead"
    ? "As a Pod Lead, you're stepping up from within the Builder Pods community to lead the charge. You’ll manage project submissions, facilitate weekly check-ins, and steer your pod toward the top of the leaderboard. Your on-chain badge is being minted and will appear on your profile once minting is complete."
    : "As a Pod Member, you are the engine. You'll join project teams, contribute to weekly activities, and ship code to earn leaderboard points. Your on-chain badge is being minted and will appear on your profile once minting is complete.";

interface Palette {
  accent: string;
  bg: string;
  border: string;
  text: string;
  muted: string;
}

const PALETTES: Record<string, Palette> = {
  pod_lead: {
    accent: "#946C00", // Deep gold
    bg: "#FFFCF5", // Very soft cream
    border: "#E9D8A6",
    text: "#453500",
    muted: "#71717A",
  },
  pod_member: {
    accent: "#2563EB", // Professional blue
    bg: "#F8FAFC", // Soft slate white
    border: "#CBD5E1",
    text: "#1E293B",
    muted: "#64748B",
  },
};

function linkRow(
  title: string,
  desc: string,
  cta: string,
  href: string,
  p: Palette,
): string {
  return `
<tr>
  <td style="padding-bottom: 12px;">
    <a href="${href}" style="text-decoration: none; display: block;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 10px; background-color: #FFFFFF;">
            <tr>
                <td style="padding: 16px;">
                    <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #0F172A; font-family: 'Inter', system-ui, sans-serif;">${title}</p>
                    <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.5; color: #64748B; font-family: 'Inter', system-ui, sans-serif;">${desc}</p>
                    <span style="font-size: 13px; font-weight: 600; color: ${p.accent}; font-family: 'Inter', system-ui, sans-serif;">${cta} &rarr;</span>
                </td>
            </tr>
        </table>
    </a>
  </td>
</tr>`;
}

export function buildRoleChangeEmail(data: RoleChangeEmailData): string {
  const { memberName, roleName, collegeName, podName } = data;
  const p = PALETTES[roleName] ?? PALETTES.pod_member;
  const label = getRoleLabel(roleName);
  const desc = getRoleDescription(roleName);
  const dashUrl = `${PLATFORM_URL}/builder-pods`;
  const year = new Date().getFullYear();
  const showRoadmapAndResources = roleName !== "pod_lead";
  const welcomeCopy =
    roleName === "pod_lead"
      ? "You’ve already been contributing in Builder Pods, and now you’re stepping into a leadership role."
      : "Welcome to <strong>Arbitrum Builder Pods</strong>. You're now part of a campus-native community shipping projects and learning on-chain.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, sans-serif; color: #334155; }
    .email-container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { padding: 48px 40px 32px; border-bottom: 1px solid #F1F5F9; }
    .content { padding: 40px; }
    .step-circle { display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; text-align: center; font-size: 12px; font-weight: 700; margin-right: 12px; }
    .footer { padding: 32px 40px; background: #F8FAFC; text-align: center; border-top: 1px solid #F1F5F9; }
    @media (max-width: 600px) {
        .email-container { margin: 0; border-radius: 0; }
        .header, .content { padding: 32px 24px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8;">Builder Pods</p>
          </td>
          <td align="right">
            <span style="background: ${p.bg}; color: ${p.accent}; border: 1px solid ${p.border}; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600;">${label}</span>
          </td>
        </tr>
      </table>
      <h1 style="margin: 24px 0 8px; font-size: 28px; font-weight: 700; color: #0F172A;">Congratulations, ${memberName}!</h1>
      <p style="margin: 0; font-size: 16px; color: #64748B;">You have been officially assigned as a <span style="color: ${p.accent}; font-weight: 600;">${label}</span>.</p>
    </div>

    <div class="content">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
        <tr>
          <td width="50%" style="padding-right: 8px;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;">
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase;">College</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0F172A;">${collegeName}</p>
            </div>
          </td>
          <td width="50%" style="padding-left: 8px;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;">
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase;">Builder Pod</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0F172A;">${podName}</p>
            </div>
          </td>
        </tr>
      </table>

      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
        ${welcomeCopy}
      </p>

      <div style="background: ${p.bg}; border-left: 4px solid ${p.accent}; padding: 20px; border-radius: 4px 12px 12px 4px; margin-bottom: 32px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${p.text};">${desc}</p>
      </div>

      ${
        showRoadmapAndResources
          ? `
      <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #94A3B8; margin-bottom: 16px; letter-spacing: 0.05em;">Your Roadmap</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
        <tr><td style="padding: 8px 0; font-size: 14px; color: #475569;"><span class="step-circle" style="background: #F1F5F9; color: #64748B;">1</span> Join the Slack Community.</td></tr>
        <tr><td style="padding: 8px 0; font-size: 14px; color: #475569;"><span class="step-circle" style="background: #F1F5F9; color: #64748B;">2</span> Review the handbook in Notion.</td></tr>
        <tr><td style="padding: 8px 0; font-size: 14px; color: #475569;"><span class="step-circle" style="background: #F1F5F9; color: #64748B;">3</span> Align with your pod on a project to ship.</td></tr>
      </table>

      <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #94A3B8; margin-bottom: 16px; letter-spacing: 0.05em;">Resources</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${linkRow("Slack Community", "Connect with your team and share updates.", "Join Workspace", SLACK_URL, p)}
        ${linkRow("Builder Handbook", "Everything you need to know about the program.", "Open Notion", NOTION_URL, p)}
      </table>
      `
          : ""
      }

      <div style="margin-top: 40px; text-align: center;">
        <a href="${dashUrl}" style="background-color: ${p.accent}; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Open Builder Dashboard</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px; font-size: 12px; color: #94A3B8;">Received because your role was updated in Xcan Builder Pods.</p>
      <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748B;">Xcan &bull; Built on Arbitrum &bull; ${year}</p>
    </div>
  </div>
</body>
</html>`.trim();
}

export function buildRoleChangeSubject(
  roleName: "pod_lead" | "pod_member",
): string {
  return roleName === "pod_lead"
    ? `You're now a Pod Lead — Welcome to Builder Pods`
    : `You're now a Pod Member — Welcome to Builder Pods`;
}

export interface PodMemberInviteEmailData {
  memberName: string;
  collegeName: string;
  podName: string;
  yesUrl: string;
  noUrl: string;
  expiryDays: number;
}

export function buildPodMemberInviteSubject(podName: string): string {
  return `Action required: Confirm your Pod Member spot — ${podName}`;
}

function inviteBullet(text: string): string {
  return `<tr><td style="padding:6px 0;font-size:14px;line-height:1.55;color:#475569;">
    <span style="color:#2563EB;font-weight:700;margin-right:8px;">&#8226;</span>${text}
  </td></tr>`;
}

export function buildPodMemberInviteEmail(data: PodMemberInviteEmailData): string {
  const { memberName, collegeName, podName, yesUrl, noUrl, expiryDays } = data;
  const p = PALETTES.pod_member;
  const year = new Date().getFullYear();
  const dashUrl = `${PLATFORM_URL.replace(/\/$/, "")}/builder-pods`;
  const btnBase =
    "display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;font-family:Inter,system-ui,sans-serif;";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,system-ui,sans-serif;color:#334155;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
    <div style="padding:36px 40px 28px;border-bottom:1px solid #F1F5F9;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;">Arbitrum Builder Pods</p>
      <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#0F172A;">Confirm your Pod Member spot</h1>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#64748B;">Hi ${memberName}, you have been <strong style="color:#0F172A;">selected</strong> for a Pod Member role. Please review the program details below and confirm your participation.</p>
    </div>
    <div style="padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td width="50%" style="padding-right:6px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;color:#94A3B8;">College</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0F172A;">${collegeName}</p>
            </div>
          </td>
          <td width="50%" style="padding-left:6px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;color:#94A3B8;">Builder Pod</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0F172A;">${podName}</p>
            </div>
          </td>
        </tr>
      </table>
      <div style="background:${p.bg};border-left:4px solid ${p.accent};padding:18px 20px;border-radius:4px 12px 12px 4px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${p.text};">About the program</p>
        <p style="margin:0;font-size:14px;line-height:1.65;color:${p.text};">
          <strong>Arbitrum Builder Pods</strong> is a campus-native builder program on Xcan. Students form college pods, ship real projects on Arbitrum, complete learning modules, and compete on pod and individual leaderboards—with on-chain credentials for key milestones.
        </p>
      </div>

      <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94A3B8;margin:0 0 10px;">What you will do as a Pod Member</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${inviteBullet("Join a project team within your pod and contribute to weekly build goals.")}
        ${inviteBullet("Participate in weekly check-ins and share progress with your pod lead.")}
        ${inviteBullet("Ship code, log deployments, and earn leaderboard points for your pod.")}
        ${inviteBullet("Collaborate with your pod and follow program guidelines shared by your pod lead.")}
      </table>

      <h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94A3B8;margin:0 0 10px;">What you receive after confirming</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${inviteBullet("<strong>Pod Member</strong> role on Xcan (activated only after you accept).")}
        ${inviteBullet("<strong>On-chain Pod Member badge</strong> attested to your wallet after acceptance.")}
        ${inviteBullet("Access to join teams, submit work, and appear on your college pod leaderboard.")}
        ${inviteBullet("A path to grow into Pod Lead and lead projects for your pod.")}
      </table>

      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0F172A;">Please confirm within ${expiryDays} days</p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#64748B;">
          Tap <strong>Yes</strong> to accept your spot—your role and badge are issued only after you confirm.
          Tap <strong>No</strong> if you cannot participate this season.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
          <tr>
            <td style="padding-right:10px;">
              <a href="${yesUrl}" style="${btnBase}background:${p.accent};color:#fff;">Yes, I accept</a>
            </td>
            <td>
              <a href="${noUrl}" style="${btnBase}background:#fff;color:#64748B;border:1px solid #CBD5E1;">No, I decline</a>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:12px;line-height:1.5;color:#94A3B8;">
          One click records your answer. No login required. Until you accept, your role stays unchanged.
        </p>
      </div>

      <p style="margin:0;text-align:center;">
        <a href="${dashUrl}" style="font-size:13px;font-weight:600;color:${p.accent};text-decoration:none;">Explore Builder Pods on Xcan &rarr;</a>
      </p>
    </div>
    <div style="padding:20px 40px;background:#F8FAFC;border-top:1px solid #F1F5F9;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94A3B8;">Xcan &bull; Built on Arbitrum &bull; ${year}</p>
    </div>
  </div>
</body>
</html>`;
}

export interface PodMemberMeetingEmailData {
  memberName: string;
  collegeName: string;
  podName: string;
  meetingLink?: string;
  meetingTime?: string;
}

export function buildPodMemberMeetingSubject(meetingTime?: string): string {
  return meetingTime
    ? `Builder Pods meeting — ${meetingTime}`
    : `Thanks for joining Builder Pods — meeting this Friday or Saturday`;
}

export function buildPodMemberMeetingEmail(
  data: PodMemberMeetingEmailData,
): string {
  const { memberName, collegeName, podName, meetingLink, meetingTime } = data;
  const p = PALETTES.pod_member;
  const year = new Date().getFullYear();
  const slackUrl = SLACK_URL?.trim();
  const showSlackLink = Boolean(slackUrl);
  const showMeetingLink = Boolean(meetingLink?.trim());
  const whenCopy = meetingTime?.trim()
    ? meetingTime.trim()
    : "Friday or Saturday";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,system-ui,sans-serif;color:#334155;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">
    <div style="padding:36px 40px 28px;border-bottom:1px solid #F1F5F9;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;">Arbitrum Builder Pods</p>
      <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#0F172A;">Thank you for participating, ${memberName}!</h1>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#64748B;">
        We’re arranging a quick meeting with you soon, around <strong style="color:#0F172A;">${whenCopy}</strong>.
        The meeting details will be shared in our <strong style="color:#0F172A;">Slack workspace</strong>.
      </p>
    </div>

    <div style="padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="50%" style="padding-right:6px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;color:#94A3B8;">College</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0F172A;">${collegeName}</p>
            </div>
          </td>
          <td width="50%" style="padding-left:6px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;color:#94A3B8;">Builder Pod</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0F172A;">${podName}</p>
            </div>
          </td>
        </tr>
      </table>

      <div style="background:${p.bg};border-left:4px solid ${p.accent};padding:18px 20px;border-radius:4px 12px 12px 4px;margin-bottom:24px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0F172A;">Please join Slack</p>
        <p style="margin:0;font-size:14px;line-height:1.65;color:#334155;">
          Join the Slack workspace so you don’t miss the meeting link and time.
        </p>
        ${
          showSlackLink
            ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.5;">
                <a href="${slackUrl}" style="display:inline-block;background:${p.accent};color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;">Join Slack Workspace &rarr;</a>
              </p>`
            : `<p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:#64748B;">
                Slack link is not configured. Please check your admin updates.
              </p>`
        }
      </div>

      ${
        showMeetingLink
          ? `<p style="margin:0 0 24px;text-align:center;">
              <a href="${meetingLink}" style="display:inline-block;background:${p.accent};color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;">Join the meeting &rarr;</a>
            </p>`
          : ""
      }

      <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">
        If you have any questions before the meeting, post them in Slack.
      </p>
    </div>

    <div style="padding:20px 40px;background:#F8FAFC;border-top:1px solid #F1F5F9;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94A3B8;">Xcan &bull; Built on Arbitrum &bull; ${year}</p>
    </div>
  </div>
</body>
</html>`;
}
