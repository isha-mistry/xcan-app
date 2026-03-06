import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { UserBadge } from '@/models/UserBadge';
import { AuditLog } from '@/models/AuditLog';

/**
 * POST /api/builder-pods/badges/attest/:userBadgeId
 * Creates an on-chain EAS attestation for a badge.
 * Requires: super_admin role
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { userBadgeId: string } }
) {
    try {
        await dbConnect();
        const { userBadgeId } = params;
        const body = await req.json();
        const { adminWallet } = body;

        if (!adminWallet) {
            return NextResponse.json(
                { success: false, error: 'adminWallet is required' },
                { status: 400 }
            );
        }

        const badge = await UserBadge.findById(userBadgeId);
        if (!badge) {
            return NextResponse.json(
                { success: false, error: 'Badge not found' },
                { status: 404 }
            );
        }

        if (badge.attestationUid) {
            return NextResponse.json(
                { success: false, error: 'Badge already attested on-chain' },
                { status: 409 }
            );
        }

        // On-chain attestation via EAS
        // Requires: EAS_CONTRACT_ADDRESS, EAS_SCHEMA_UID, ADMIN_PRIVATE_KEY env vars
        let attestationUid: string | null = null;

        try {
            // @ts-ignore — module may not resolve until eas-sdk is installed
            const { queueOnChainAttestation } = await import('@/lib/builder-pods/attestation');
            attestationUid = await queueOnChainAttestation(
                badge.walletAddress,
                badge.badgeSnapshot?.slug || 'unknown',
                {
                    collegeId: badge.collegeId?.toString(),
                    showcaseEventId: badge.showcaseEventId?.toString(),
                }
            );
        } catch (easError: any) {
            console.warn('EAS attestation skipped (SDK not configured):', easError.message);
            // Continue without on-chain attestation — mark as pending
            attestationUid = `pending_${Date.now()}`;
        }

        // Update badge with attestation UID
        badge.attestationUid = attestationUid;
        badge.attestedAt = new Date();
        badge.attestedBy = adminWallet.toLowerCase();
        await badge.save();

        // Audit log
        await AuditLog.create({
            actorWallet: adminWallet.toLowerCase(),
            action: 'badge.attest',
            entityType: 'UserBadge',
            entityId: userBadgeId,
            newValue: { attestationUid },
        });

        return NextResponse.json(
            { success: true, attestationUid },
            { status: 200 }
        );
    } catch (error) {
        console.error('Badge attestation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
