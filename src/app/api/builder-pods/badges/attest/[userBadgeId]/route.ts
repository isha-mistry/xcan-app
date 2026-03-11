import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { UserBadge } from '@/models/UserBadge';
import { AuditLog } from '@/models/AuditLog';
import { getAuthContext, requireRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';

/**
 * POST /api/builder-pods/badges/attest/:userBadgeId
 * Creates an on-chain EAS attestation for a badge.
 * Requires: super_admin JWT in Authorization header.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { userBadgeId: string } }
) {
    try {
        // ── RBAC ──────────────────────────────────────────────────────────────
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');
        const adminWallet = ctx!.walletAddress; // from verified JWT

        await dbConnect();
        const { userBadgeId } = params;

        // ── Find badge ────────────────────────────────────────────────────────
        const badge = await UserBadge.findById(userBadgeId);
        if (!badge) {
            return NextResponse.json(
                { success: false, error: 'Badge not found' },
                { status: 404 }
            );
        }

        // ── Already attested? ─────────────────────────────────────────────────
        if (badge.easUid) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Badge already attested on-chain',
                    easUid: badge.easUid,
                    explorerUrl: `https://sepolia.easscan.org/attestation/view/${badge.easUid}`,
                },
                { status: 409 }
            );
        }

        // ── EAS env var check — give clear error if not set ───────────────────
        const missingVars = ['SEPOLIA_RPC', 'ISSUER_PRIVATE_KEY', 'EAS_SCHEMA_UID']
            .filter((k) => !process.env[k]);

        if (missingVars.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `EAS not configured. Missing env vars: ${missingVars.join(', ')}`,
                    hint: 'Add these to .env and restart the dev server',
                },
                { status: 503 }
            );
        }

        // ── On-chain attestation ──────────────────────────────────────────────
        let easUid: string;
        let explorerUrl: string;

        const { queueOnChainAttestation } = await import('@/lib/builder-pods/attestation');
        easUid = await queueOnChainAttestation(
            badge.walletAddress,
            badge.badgeSnapshot?.slug || 'unknown',
            {
                collegeId: badge.collegeId?.toString(),
                showcaseEventId: badge.showcaseEventId?.toString(),
            }
        );
        explorerUrl = `https://sepolia.easscan.org/attestation/view/${easUid}`;

        // ── Persist UID back to UserBadge ─────────────────────────────────────
        badge.easUid = easUid;
        badge.onChainAttested = true;
        badge.attestedAt = new Date();
        await badge.save();

        // ── Audit log ─────────────────────────────────────────────────────────
        await AuditLog.create({
            actorWallet: adminWallet,
            action: 'badge.attest',
            entityType: 'UserBadge',
            entityId: userBadgeId,
            newValue: { easUid, explorerUrl },
        });

        return NextResponse.json(
            {
                success: true,
                easUid,
                explorerUrl,
                badge: {
                    walletAddress: badge.walletAddress,
                    badgeType: badge.badgeSnapshot?.slug,
                    attestedAt: badge.attestedAt,
                },
            },
            { status: 200 }
        );

    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Badge attestation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
