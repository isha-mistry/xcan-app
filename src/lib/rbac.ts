import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { UserRole } from '@/models/PlatformRole';
import { dbConnect } from '@/lib/dbConnect';

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

export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    try {
        const payload = verifyJWT(token) as { walletAddress?: string; address?: string };
        const walletAddress = (payload.walletAddress || payload.address || '').toLowerCase();
        if (!walletAddress) return null;

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
    } catch {
        return null;
    }
}

export function isSuperAdmin(ctx: AuthContext): boolean {
    return ctx.roles.some((r) => r.slug === 'super_admin');
}

export function hasRole(ctx: AuthContext, role: RoleSlug, collegeId?: string): boolean {
    if (isSuperAdmin(ctx)) return true;
    return ctx.roles.some(
        (r) => r.slug === role && (r.collegeId === null || r.collegeId === collegeId)
    );
}

export function requireRole(ctx: AuthContext | null, role: RoleSlug, collegeId?: string): void {
    if (!ctx) throw new UnauthorizedError('Not authenticated');
    if (!hasRole(ctx, role, collegeId)) throw new ForbiddenError(`Requires role: ${role}`);
}

export class UnauthorizedError extends Error {
    statusCode = 401;
}
export class ForbiddenError extends Error {
    statusCode = 403;
}
