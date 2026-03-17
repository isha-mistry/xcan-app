import { BadgeType } from '@/models/BadgeType';
import { UserBadge } from '@/models/UserBadge';

type BadgeTrigger =
    | 'lab_registration'
    | 'pod_member_approved'
    | 'showcase_finalist'
    | 'showcase_winner'
    | 'manual_assignment';

const triggerToSlug: Record<BadgeTrigger, string> = {
    lab_registration: 'builder_lab_participant',
    pod_member_approved: 'builder_pod_member',
    showcase_finalist: 'regional_showcase_finalist',
    showcase_winner: 'regional_showcase_winner',
    manual_assignment: 'builder_pod_lead',
};

/**
 * Fire-and-forget on-chain attestation.
 * Runs asynchronously — if it fails the badge still exists in the DB
 * and can be attested later via the admin UI.
 */
async function attestBadgeOnChain(userBadgeId: string, walletAddress: string, badgeSlug: string, context: { collegeId?: string; showcaseEventId?: string }): Promise<void> {
    try {
        const hasEasConfig = process.env.SEPOLIA_RPC && process.env.ISSUER_PRIVATE_KEY && process.env.EAS_SCHEMA_UID;
        if (!hasEasConfig) return;

        const { queueOnChainAttestation } = await import('@/lib/builder-pods/attestation');
        const easUid = await queueOnChainAttestation(walletAddress, badgeSlug, context);

        await UserBadge.updateOne(
            { _id: userBadgeId },
            { $set: { easUid, onChainAttested: true, attestedAt: new Date() } }
        );
    } catch (err) {
        console.error(`[badges] On-chain attestation failed for ${userBadgeId}:`, err);
    }
}

export async function awardBadgeOnEvent(
    trigger: BadgeTrigger,
    walletAddress: string,
    context: { collegeId?: string; showcaseEventId?: string }
): Promise<void> {
    const slug = triggerToSlug[trigger];
    const badgeType = await BadgeType.findOne({ slug }).lean() as any;
    if (!badgeType) return;

    const result = await UserBadge.findOneAndUpdate(
        {
            walletAddress,
            badgeTypeId: badgeType._id,
            collegeId: context.collegeId ?? null,
        },
        {
            $setOnInsert: {
                walletAddress,
                badgeTypeId: badgeType._id,
                badgeSnapshot: {
                    slug: badgeType.slug,
                    label: badgeType.label,
                    iconUrl: badgeType.iconUrl,
                },
                collegeId: context.collegeId ?? null,
                showcaseEventId: context.showcaseEventId ?? null,
                assignedAt: new Date(),
            },
        },
        { upsert: true, new: true }
    );

    if (result && !result.easUid) {
        attestBadgeOnChain(result._id.toString(), walletAddress, slug, context).catch(() => {});
    }
}

export async function assignBadgeManually(
    badgeSlug: string,
    walletAddress: string,
    assignedBy: string,
    context: { collegeId?: string; showcaseEventId?: string }
): Promise<void> {
    const badgeType = await BadgeType.findOne({ slug: badgeSlug }).lean() as any;
    if (!badgeType) throw new Error(`Badge type not found: ${badgeSlug}`);

    const result = await UserBadge.findOneAndUpdate(
        {
            walletAddress,
            badgeTypeId: badgeType._id,
            collegeId: context.collegeId ?? null,
        },
        {
            $setOnInsert: {
                walletAddress,
                badgeTypeId: badgeType._id,
                badgeSnapshot: {
                    slug: badgeType.slug,
                    label: badgeType.label,
                    iconUrl: badgeType.iconUrl,
                },
                collegeId: context.collegeId ?? null,
                showcaseEventId: context.showcaseEventId ?? null,
                assignedBy,
                assignedAt: new Date(),
            },
        },
        { upsert: true, new: true }
    );

    if (result && !result.easUid) {
        attestBadgeOnChain(result._id.toString(), walletAddress, badgeSlug, context).catch(() => {});
    }
}
