import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { UserRole } from '@/models/PlatformRole';
import { dbConnect } from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { getPrivyClient } from '@/lib/privy';

export type RoleSlug =
    | 'super_admin'
    | 'college_admin'
    | 'mentor'
    | 'pod_lead'
    | 'pod_member'
    | 'faculty_coordinator';

export interface AuthContext {
    walletAddress: string;
    roles: { slug: RoleSlug; collegeId: string | null }[];
}

/**
 * Extract authenticated wallet from one of three methods:
 *   1. Bearer JWT token in Authorization header (curl / Postman / scripts)
 *   2. NextAuth session cookie (SIWE-based browser sessions)
 *   3. Privy token cookie (Privy-based browser sessions)
 *
 * Then lookup the wallet's assigned roles from the UserRole collection.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
    let walletAddress: string | null = null;

    // ── Method 1: Bearer token ──────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.replace('Bearer ', '');
            const payload = verifyJWT(token) as { walletAddress?: string; address?: string; sub?: string };
            walletAddress = (payload.walletAddress || payload.address || payload.sub || '').toLowerCase();
        } catch {
            // Invalid JWT — fall through to session check
        }
    }

    // ── Method 2: Privy token cookie ────────────────────────────────────────
    if (!walletAddress) {
        const privyToken = req.cookies.get('privy-token')?.value;
        if (privyToken) {
            try {
                const privyClient = getPrivyClient();
                const verifiedUser = await privyClient.verifyAuthToken(privyToken);
                const privyUser = await privyClient.getUserById(verifiedUser.userId);
                const wallet = privyUser.linkedAccounts.find(
                    (a) => a.type === 'wallet'
                ) as any;
                if (wallet?.address) {
                    walletAddress = (wallet.address as string).toLowerCase();
                }
            } catch {
                // Invalid Privy token — fall through
            }
        }
    }

    // ── Method 3: NextAuth session cookie ───────────────────────────────────
    if (!walletAddress) {
        try {
            const session = await getServerSession(authOptions) as any;
            if (session?.address) {
                walletAddress = session.address.toLowerCase();
            } else if (session?.user?.name) {
                walletAddress = session.user.name.toLowerCase();
            }
        } catch {
            // No session available
        }
    }

    if (!walletAddress) return null;

    // ── Fetch roles ─────────────────────────────────────────────────────────
    await dbConnect();
    const roles = await UserRole.find(
        { walletAddress, revokedAt: null },
        { roleSlug: 1, collegeId: 1, _id: 0 }
    ).lean();

    return {
        walletAddress,
        roles: roles.map((r: any) => ({
            slug: r.roleSlug as RoleSlug,
            collegeId: r.collegeId?.toString() ?? null,
        })),
    };
}

// ─── Role Check Helpers ─────────────────────────────────────────────────────

export function isSuperAdmin(ctx: AuthContext): boolean {
    return ctx.roles.some((r) => r.slug === 'super_admin');
}

/** Check if ctx has a specific role, optionally scoped to a collegeId. */
export function hasRole(ctx: AuthContext, role: RoleSlug, collegeId?: string): boolean {
    if (isSuperAdmin(ctx)) return true;
    return ctx.roles.some(
        (r) => r.slug === role && (r.collegeId === null || r.collegeId === collegeId)
    );
}

/** Check if ctx has ANY of the listed roles. super_admin always passes. */
export function hasAnyRole(ctx: AuthContext, roles: RoleSlug[], collegeId?: string): boolean {
    if (isSuperAdmin(ctx)) return true;
    return roles.some((role) =>
        ctx.roles.some(
            (r) => r.slug === role && (r.collegeId === null || r.collegeId === collegeId)
        )
    );
}

/** Throw if ctx is null (401) or lacks the required role (403). */
export function requireRole(ctx: AuthContext | null, role: RoleSlug, collegeId?: string): void {
    if (!ctx) throw new UnauthorizedError('Not authenticated');
    if (!hasRole(ctx, role, collegeId)) throw new ForbiddenError(`Requires role: ${role}`);
}

/**
 * Throw if ctx is null (401) or lacks ANY of the listed roles (403).
 * Use this for routes that accept multiple roles.
 */
export function requireAnyRole(ctx: AuthContext | null, roles: RoleSlug[], collegeId?: string): void {
    if (!ctx) throw new UnauthorizedError('Not authenticated');
    if (!hasAnyRole(ctx, roles, collegeId))
        throw new ForbiddenError(`Requires one of: ${roles.join(', ')}`);
}

// ─── College Scope Helpers ──────────────────────────────────────────────────

/**
 * Returns the list of college IDs this user is scoped to.
 * - super_admin → null (meaning ALL colleges, no filtering needed)
 * - college_admin for MIT → ['<mit-college-id>']
 * - mentor for MIT + IIT → ['<mit-id>', '<iit-id>']
 */
export function getCollegeScope(ctx: AuthContext): string[] | null {
    if (isSuperAdmin(ctx)) return null; // null = unrestricted

    const collegeIds = ctx.roles
        .filter((r) => r.collegeId !== null)
        .map((r) => r.collegeId as string);

    // De-duplicate
    return [...new Set(collegeIds)];
}

/**
 * Build a MongoDB filter that restricts queries to the user's scoped colleges.
 * - super_admin → {} (no filter, sees everything)
 * - college_admin for MIT → { collegeId: { $in: ['<mit-id>'] } }
 *
 * @param ctx - The authenticated user context
 * @param fieldName - The MongoDB field name to filter on (default: 'collegeId')
 */
export function buildCollegeFilter(ctx: AuthContext, fieldName: string = 'collegeId'): Record<string, any> {
    const scope = getCollegeScope(ctx);
    if (scope === null) return {}; // super_admin sees all
    return { [fieldName]: { $in: scope } };
}

/**
 * Verify that the user has access to a specific college.
 * super_admin always passes. For others, checks if any of their roles
 * are scoped to this specific collegeId.
 */
export function verifyCollegeAccess(ctx: AuthContext, collegeId: string): void {
    if (isSuperAdmin(ctx)) return;
    const scope = getCollegeScope(ctx);
    if (!scope || !scope.includes(collegeId)) {
        throw new ForbiddenError('You do not have access to this college');
    }
}

// ─── Error Classes ──────────────────────────────────────────────────────────

export class UnauthorizedError extends Error {
    statusCode = 401;
}
export class ForbiddenError extends Error {
    statusCode = 403;
}
