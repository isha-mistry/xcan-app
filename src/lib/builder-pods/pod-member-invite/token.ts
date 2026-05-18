import crypto from 'crypto';

const TOKEN_BYTES = 32;

export function generateInviteToken(): string {
    return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

export function hashInviteToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyInviteToken(token: string, storedHash: string | null | undefined): boolean {
    if (!token || !storedHash) return false;
    try {
        return crypto.timingSafeEqual(
            Buffer.from(hashInviteToken(token), 'hex'),
            Buffer.from(storedHash, 'hex'),
        );
    } catch {
        return false;
    }
}

export const POD_MEMBER_INVITE_EXPIRY_DAYS_DEFAULT = 2;

export function getPodMemberInviteExpiryDays(): number {
    const days = Number(process.env.POD_MEMBER_INVITE_EXPIRY_DAYS);
    return Number.isFinite(days) && days > 0 ? days : POD_MEMBER_INVITE_EXPIRY_DAYS_DEFAULT;
}

export function getInviteExpiryDate(): Date {
    const days = getPodMemberInviteExpiryDays();
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/** Base URL for links in emails — localhost in dev unless NEXT_PUBLIC_APP_URL is set. */
export function getInviteEmailBaseUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (explicit) return explicit.replace(/\/$/, '');

    if (process.env.NODE_ENV === 'development') {
        return (
            process.env.NEXT_PUBLIC_LOCAL_BASE_URL?.trim() ||
            'http://localhost:3000'
        ).replace(/\/$/, '');
    }

    return 'https://www.xcan.dev';
}

export function buildInviteActionUrls(rawToken: string): { yesUrl: string; noUrl: string } {
    const base = getInviteEmailBaseUrl();
    const encoded = encodeURIComponent(rawToken);
    return {
        yesUrl: `${base}/builder-pods/invite/accept?token=${encoded}`,
        noUrl: `${base}/builder-pods/invite/decline?token=${encoded}`,
    };
}
