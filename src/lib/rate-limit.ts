const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of rateLimitMap) {
        if (entry.resetAt <= now) rateLimitMap.delete(key);
    }
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

export function checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): RateLimitResult {
    cleanup();
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || entry.resetAt <= now) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    entry.count += 1;
    const allowed = entry.count <= maxRequests;
    return {
        allowed,
        remaining: Math.max(0, maxRequests - entry.count),
        resetAt: entry.resetAt,
    };
}
