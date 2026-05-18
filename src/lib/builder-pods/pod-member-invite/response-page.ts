import { getInviteEmailBaseUrl } from '@/lib/builder-pods/pod-member-invite/token';

type Variant = 'accepted' | 'declined' | 'error';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const VARIANT_CONFIG: Record<
    Variant,
    { accent: string; accentSoft: string; icon: string }
> = {
    accepted: {
        accent: '#3B82F6',
        accentSoft: 'rgba(59, 130, 246, 0.15)',
        icon: '&#10003;',
    },
    declined: {
        accent: '#94A3B8',
        accentSoft: 'rgba(148, 163, 184, 0.12)',
        icon: '&mdash;',
    },
    error: {
        accent: '#F87171',
        accentSoft: 'rgba(248, 113, 113, 0.12)',
        icon: '!',
    },
};

export function buildInviteResponsePage(opts: {
    variant: Variant;
    title: string;
    message: string;
    detail?: string;
}): string {
    const { variant, title, message, detail } = opts;
    const cfg = VARIANT_CONFIG[variant];
    const year = new Date().getFullYear();
    const base = getInviteEmailBaseUrl();
    const homeUrl = `${base}/`;
    const builderPodsUrl = `${base}/builder-pods`;

    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const safeDetail = detail ? escapeHtml(detail) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeTitle} — Xcan Builder Pods</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.9);
      background: #0a0f17;
      background-image:
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.18), transparent),
        radial-gradient(ellipse 60% 40% at 100% 100%, rgba(59, 130, 246, 0.08), transparent);
    }
    .brand {
      margin-bottom: 24px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.45);
    }
    .brand span { color: rgba(255, 255, 255, 0.85); }
    .card {
      max-width: 440px;
      width: 100%;
      padding: 40px 32px 32px;
      text-align: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
    }
    .icon {
      width: 64px;
      height: 64px;
      line-height: 64px;
      margin: 0 auto 24px;
      border-radius: 50%;
      font-size: 26px;
      font-weight: 700;
      color: ${cfg.accent};
      background: ${cfg.accentSoft};
      border: 1px solid ${cfg.accent}40;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .message {
      margin: 0;
      font-size: 15px;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.65);
    }
    .detail {
      margin: 12px 0 0;
      font-size: 13px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.4);
    }
    .actions {
      margin-top: 28px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    a.btn {
      display: inline-block;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
    }
    .btn-primary {
      color: #fff;
      background: linear-gradient(180deg, #3B82F6 0%, #2563EB 100%);
      border: 1px solid rgba(96, 165, 250, 0.4);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    }
    .btn-secondary {
      color: rgba(255, 255, 255, 0.75);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    footer {
      margin-top: 24px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <p class="brand"><span>Xcan</span> &bull; Builder Pods</p>
  <div class="card">
    <div class="icon">${cfg.icon}</div>
    <h1>${safeTitle}</h1>
    <p class="message">${safeMessage}</p>
    ${safeDetail ? `<p class="detail">${safeDetail}</p>` : ''}
    <div class="actions">
      <a class="btn btn-primary" href="${builderPodsUrl}">Go to Builder Pods</a>
      <a class="btn btn-secondary" href="${homeUrl}">Home</a>
    </div>
    <footer>Built on Arbitrum &bull; ${year}</footer>
  </div>
</body>
</html>`;
}
