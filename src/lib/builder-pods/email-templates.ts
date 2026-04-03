/**
 * Builder Pods — Role assignment email template.
 * Production-grade, responsive HTML email for pod_lead and pod_member roles.
 *
 * KEY ARCHITECTURE NOTE:
 * Inline style="" beats media queries even with !important for padding/width/height.
 * Fix: desktop values for those properties live in the <style> block via class
 * selectors — not inline. Media query overrides can then cascade correctly.
 * Only non-responsive properties (colors, borders, font-family, etc.) stay inline.
 */

const PLATFORM_URL = process.env.NEXT_PUBLIC_APP_URL    || 'https://www.xcan.dev';
const SLACK_URL    = process.env.BUILDER_POD_SLACK_URL  || 'https://join.slack.com/t/xcan-community/shared_invite/zt-21f7y7v7f-bTpG6X_kOeP54t7o4TzL7w';
const NOTION_URL   = process.env.BUILDER_POD_NOTION_URL || 'https://lamprosdao.notion.site/arbitrum-builder-pods';

interface RoleChangeEmailData {
    memberName : string;
    roleName   : 'pod_lead' | 'pod_member';
    collegeName: string;
    podName    : string;
}

const getRoleLabel = (role: string) =>
    role === 'pod_lead' ? 'Pod Lead' : 'Pod Member';

const getRoleDescription = (role: string) =>
    role === 'pod_lead'
        ? 'You can now submit projects, run weekly pod check-ins, and lead your Builder Pod to the top of the leaderboard. Your on-chain Pod Lead badge will be issued shortly.'
        : 'You can now join project teams, contribute to weekly pod activities, and earn points on the leaderboard. Your on-chain Pod Member badge will be issued shortly.';

interface Palette {
    accent   : string;
    accentDim: string;
    accentBdr: string;
    btnFrom  : string;
    btnTo    : string;
    tagBg    : string;
    tagTxt   : string;
}

const PALETTES: Record<string, Palette> = {
    pod_lead: {
        accent   : '#E8A020',
        accentDim: 'rgba(232,160,32,0.10)',
        accentBdr: 'rgba(232,160,32,0.28)',
        btnFrom  : '#C98A14',
        btnTo    : '#A36A08',
        tagBg    : 'rgba(232,160,32,0.12)',
        tagTxt   : '#E8A020',
    },
    pod_member: {
        accent   : '#4F8EF7',
        accentDim: 'rgba(79,142,247,0.10)',
        accentBdr: 'rgba(79,142,247,0.28)',
        btnFrom  : '#2B6AE8',
        btnTo    : '#1A4FBD',
        tagBg    : 'rgba(79,142,247,0.12)',
        tagTxt   : '#4F8EF7',
    },
};

function linkRow(
    icon: string, title: string, desc: string,
    cta: string, href: string, p: Palette
): string {
    return `
<tr>
  <td class="link-row-cell">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#111320;border:1px solid rgba(255,255,255,0.07);
                   border-radius:10px;padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="link-icon-td" valign="top">
                <div class="link-icon-box"
                     style="background:${p.accentDim};border:1px solid ${p.accentBdr};
                            text-align:center;border-radius:8px;">${icon}</div>
              </td>
              <td class="link-text-td" valign="top">
                <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#E2E6F0;
                           font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${title}</p>
                <p style="margin:0 0 10px;font-size:13px;line-height:1.55;color:#5E6680;
                           font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${desc}</p>
                <a href="${href}" target="_blank"
                   style="font-size:12px;font-weight:700;color:${p.accent};text-decoration:none;
                          letter-spacing:0.2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  ${cta}&nbsp;&#8594;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

export function buildRoleChangeEmail(data: RoleChangeEmailData): string {
    const { memberName, roleName, collegeName, podName } = data;
    const p       = PALETTES[roleName] ?? PALETTES.pod_member;
    const label   = getRoleLabel(roleName);
    const desc    = getRoleDescription(roleName);
    const icon    = roleName === 'pod_lead' ? '&#x1F451;' : '&#x1F680;';
    const dashUrl = `${PLATFORM_URL}/builder-pods`;
    const year    = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark">
  <title>You're now a ${label} — Builder Pods</title>
  <style>
    body,table,td,p,a { -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
    table,td { mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse; }
    img { border:0;line-height:100%;outline:0;text-decoration:none; }

    body {
      margin:0;padding:0;background-color:#08090E;
      font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
      -webkit-font-smoothing:antialiased;
    }

    /* ─────────────────────────────────────────
       DESKTOP BASE
       All padding / width / height / font-size
       values that mobile overrides MUST be here,
       not in inline style="".
    ───────────────────────────────────────── */
    .outer       { padding:40px 16px; }
    .card        { border-radius:16px; }

    .header      { padding:36px 32px 28px; }
    .toprow-wrap { margin-bottom:28px; }

    .icon-cell   { width:52px; padding-right:16px; vertical-align:top; }
    .icon-box    { display:block;width:44px;height:44px;line-height:44px;
                   font-size:20px;border-radius:10px;text-align:center; }

    .header-title { margin:0 0 6px;font-size:24px;font-weight:800;
                    letter-spacing:-0.5px;line-height:1.15;color:#FFFFFF;
                    font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
    .header-sub   { margin:0;font-size:14px;line-height:1.5;
                    color:rgba(255,255,255,0.38);
                    font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }

    .body-pad    { padding:28px 32px; }

    .meta-cell   { width:50%;padding:14px 18px;vertical-align:top; }
    .meta-cell-r { width:50%;padding:14px 18px;vertical-align:top;
                   border-left:1px solid rgba(255,255,255,0.07); }

    .desc-p      { margin:0 0 26px;font-size:14px;line-height:1.75;
                   color:rgba(255,255,255,0.45);
                   font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
    .section-lbl { margin:0 0 12px;font-size:10px;font-weight:700;
                   letter-spacing:1.6px;text-transform:uppercase;
                   color:rgba(255,255,255,0.22);
                   font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }

    .link-row-cell { padding:0 0 8px; }
    .link-icon-td  { width:52px;padding:16px 0 16px 16px; }
    .link-icon-box { display:block;width:30px;height:30px;line-height:30px;font-size:15px; }
    .link-text-td  { padding:16px 16px 16px 10px; }

    .cta-wrap    { margin-top:24px; }
    .cta-btn     { display:inline-block;padding:13px 40px;font-size:14px;
                   font-weight:700;color:#FFFFFF;text-decoration:none;
                   border-radius:10px;letter-spacing:0.2px;
                   font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }

    .footer-pad  { padding:20px 32px; }
    .footer-p1   { margin:0 0 4px;font-size:12px;line-height:1.6;
                   color:rgba(255,255,255,0.18);text-align:center;
                   font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
    .footer-p2   { margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;
                   text-transform:uppercase;text-align:center;
                   color:rgba(255,255,255,0.12);
                   font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }

    /* ─────────────────────────────────────────
       TABLET  480px – 599px
    ───────────────────────────────────────── */
    @media only screen and (max-width:599px) {
      .outer        { padding:16px 10px; }
      .card         { border-radius:14px; }
      .header       { padding:26px 22px 22px; }
      .toprow-wrap  { margin-bottom:22px; }
      .icon-cell    { width:46px;padding-right:13px; }
      .icon-box     { width:40px;height:40px;line-height:40px;font-size:18px;border-radius:9px; }
      .header-title { font-size:21px; }
      .header-sub   { font-size:13px; }
      .body-pad     { padding:22px; }
      .meta-cell    { padding:12px 16px; }
      .meta-cell-r  { padding:12px 16px; }
      .desc-p       { margin-bottom:20px; }
      .link-row-cell{ padding-bottom:7px; }
      .link-icon-td { width:46px;padding:14px 0 14px 14px; }
      .link-icon-box{ width:28px;height:28px;line-height:28px;font-size:14px; }
      .link-text-td { padding:14px 14px 14px 10px; }
      .cta-wrap     { margin-top:20px; }
      .cta-btn      { padding:13px 32px; }
      .footer-pad   { padding:16px 22px; }
    }

    /* ─────────────────────────────────────────
       SMALL MOBILE  ≤ 480px
    ───────────────────────────────────────── */
    @media only screen and (max-width:480px) {
      .outer        { padding:10px 8px; }
      .card         { border-radius:12px; }
      .header       { padding:20px 16px 18px; }
      .toprow-wrap  { margin-bottom:18px; }
      .icon-cell    { width:40px;padding-right:12px; }
      .icon-box     { width:34px;height:34px;line-height:34px;font-size:16px;border-radius:8px; }
      .header-title { font-size:19px;letter-spacing:-0.3px; }
      .header-sub   { font-size:12px; }
      .body-pad     { padding:16px; }
      .meta-cell    { display:block;width:100%;padding:10px 14px; }
      .meta-cell-r  { display:block;width:100%;padding:10px 14px;
                      border-left:none;border-top:1px solid rgba(255,255,255,0.07); }
      .desc-p       { margin-bottom:18px;font-size:13px; }
      .section-lbl  { margin-bottom:10px; }
      .link-row-cell{ padding-bottom:6px; }
      .link-icon-td { width:38px;padding:12px 0 12px 12px; }
      .link-icon-box{ width:26px;height:26px;line-height:26px;font-size:13px;border-radius:6px; }
      .link-text-td { padding:12px 12px 12px 9px; }
      .cta-wrap     { margin-top:18px; }
      .cta-btn      { display:block;text-align:center;padding:13px 20px; }
      .footer-pad   { padding:14px 16px; }
      .footer-p1    { font-size:11px; }
    }
  </style>
</head>

<body>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background-color:#08090E;">
  <tr>
    <td align="center" class="outer">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card"
             style="max-width:560px;background-color:#0D0F18;overflow:hidden;
                    border:1px solid rgba(255,255,255,0.08);">

        <!-- ── HEADER ── -->
        <tr>
          <td class="header"
              style="background:#0D0F18;border-bottom:1px solid rgba(255,255,255,0.07);">

            <!-- Wordmark · Role tag -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   class="toprow-wrap">
              <tr>
                <td style="vertical-align:middle;">
                  <span style="font-size:11px;font-weight:700;letter-spacing:2px;
                               text-transform:uppercase;color:rgba(255,255,255,0.25);
                               font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    Builder&nbsp;Pods
                  </span>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;padding:4px 11px;border-radius:20px;
                               background:${p.tagBg};border:1px solid ${p.accentBdr};
                               font-size:10px;font-weight:700;letter-spacing:0.5px;
                               text-transform:uppercase;color:${p.tagTxt};
                               font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    ${label}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Icon · Headline -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="icon-cell">
                  <div class="icon-box"
                       style="background:${p.accentDim};border:1px solid ${p.accentBdr};">
                    ${icon}
                  </div>
                </td>
                <td style="vertical-align:middle;">
                  <h1 class="header-title">Congratulations, ${memberName}</h1>
                  <p class="header-sub">
                    You've been assigned as
                    <span style="color:${p.accent};font-weight:600;">${label}</span>
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td class="body-pad">

            <!-- College / Pod meta -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="margin-bottom:22px;background:#0A0C15;
                          border:1px solid rgba(255,255,255,0.07);border-radius:10px;
                          overflow:hidden;">
              <tr>
                <td class="meta-cell">
                  <p style="margin:0 0 5px;font-size:10px;font-weight:700;
                             letter-spacing:1.4px;text-transform:uppercase;
                             color:rgba(255,255,255,0.25);
                             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    College
                  </p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#C8CDE0;
                             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    ${collegeName}
                  </p>
                </td>
                <td class="meta-cell-r">
                  <p style="margin:0 0 5px;font-size:10px;font-weight:700;
                             letter-spacing:1.4px;text-transform:uppercase;
                             color:rgba(255,255,255,0.25);
                             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    Builder Pod
                  </p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#C8CDE0;
                             font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    ${podName}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Description -->
            <p class="desc-p">
              Hey ${memberName}, welcome to <span style="color:${p.accent};font-weight:600;">Arbitrum Builder Pods</span> — a campus-native builder community where small pods ship projects, learn on-chain, and climb the leaderboard together.
            </p>
            <p class="desc-p">
              ${desc}
            </p>

            <!-- What is this pod? -->
            <p class="section-lbl">About your Builder Pod</p>
            <p class="desc-p">
              Your pod <span style="color:#C8CDE0;font-weight:600;">${podName}</span> at
              <span style="color:#C8CDE0;font-weight:600;">${collegeName}</span> is a small team of builders who meet regularly, share progress, and ship on-chain experiments together. Each week, your pod syncs, posts a short update, and earns points based on consistency and shipped work.
            </p>

            <!-- Next steps & weekly cadence -->
            <p class="section-lbl">Next steps & weekly updates</p>
            <p class="desc-p" style="margin-bottom:18px;">
              Over the next few days:
              <br><br>
              <span style="color:#C8CDE0;">1.</span> Join the Slack workspace and find your <span style="color:#C8CDE0;font-weight:600;">#builder-pods</span> channel.<br>
              <span style="color:#C8CDE0;">2.</span> Review the Builder Pods handbook and resources in Notion.<br>
              <span style="color:#C8CDE0;">3.</span> Align with your pod on a project to ship this cycle and how you’ll run weekly check-ins.<br>
              <span style="color:#C8CDE0;">4.</span> Start sharing a short weekly update from your pod on progress, blockers, and next week’s plan.
            </p>

            <!-- Section label -->
            <p class="section-lbl">Links you'll need</p>

            <!-- Link cards -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${linkRow('💬', 'Slack Community',         'Say hi to your pod, ask questions, and share quick weekly updates.',           'Join Slack',      SLACK_URL,  p)}
              ${linkRow('📄', 'Builder Pods Notion Hub', 'Overview of Builder Pods, weekly expectations, project ideas, and all key resources.', 'Open Notion',     NOTION_URL, p)}
            </table>

            <!-- CTA -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   class="cta-wrap">
              <tr>
                <td align="center">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                    href="${dashUrl}" style="height:46px;v-text-anchor:middle;width:210px;"
                    arcsize="20%" stroke="f" fillcolor="${p.btnFrom}">
                    <w:anchorlock/>
                    <center style="color:#fff;font-family:sans-serif;font-size:14px;font-weight:700;">
                      Open Builder Pods
                    </center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${dashUrl}" target="_blank" class="cta-btn"
                     style="background:linear-gradient(135deg,${p.btnFrom} 0%,${p.btnTo} 100%);">
                    Open Builder Pods
                  </a>
                  <!--<![endif]-->
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td class="footer-pad" style="border-top:1px solid rgba(255,255,255,0.06);">
            <p class="footer-p1">
              You're receiving this because your role was updated in Xcan Builder Pods.
            </p>
            <p class="footer-p2">
              Xcan &nbsp;&middot;&nbsp; Built on Arbitrum &nbsp;&middot;&nbsp; ${year}
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`.trim();
}

export function buildRoleChangeSubject(roleName: 'pod_lead' | 'pod_member'): string {
    return roleName === 'pod_lead'
        ? `You're now a Pod Lead — Welcome to Builder Pods`
        : `You're now a Pod Member — Welcome to Builder Pods`;
}