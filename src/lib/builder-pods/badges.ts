import { BadgeType } from '@/models/BadgeType';
import { UserBadge } from '@/models/UserBadge';
import { Notification } from '@/models/Notification';

type BadgeTrigger =
    | 'lab_registration'
    | 'pod_member_approved'
    | 'pod_participant_approved'
    | 'showcase_finalist'
    | 'showcase_winner'
    | 'manual_assignment';

const triggerToSlug: Record<BadgeTrigger, string> = {
    lab_registration: 'builder_lab_participant',
    pod_member_approved: 'builder_pod_member',
    pod_participant_approved: 'builder_lab_participant',
    showcase_finalist: 'regional_showcase_finalist',
    showcase_winner: 'regional_showcase_winner',
    manual_assignment: 'builder_pod_lead',
};

/**
 * On-chain attestation helper.
 * Returns easUid when successful; otherwise returns null.
 */
async function attestBadgeOnChain(
    userBadgeId: string,
    walletAddress: string,
    badgeSlug: string,
    context: { collegeId?: string; showcaseEventId?: string }
): Promise<string | null> {
    try {
        const hasEasConfig = process.env.SEPOLIA_RPC && process.env.ISSUER_PRIVATE_KEY && process.env.EAS_SCHEMA_UID;
        if (!hasEasConfig) return null;

        const { queueOnChainAttestation } = await import('@/lib/builder-pods/attestation');
        const easUid = await queueOnChainAttestation(walletAddress, badgeSlug, context);

        await UserBadge.updateOne(
            { _id: userBadgeId },
            { $set: { easUid, onChainAttested: true, attestedAt: new Date() } }
        );
        return easUid;
    } catch (err) {
        console.error(`[badges] On-chain attestation failed for ${userBadgeId}:`, err);
        return null;
    }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
        const timeout = new Promise<null>((resolve) => {
            timer = setTimeout(() => resolve(null), timeoutMs);
        });
        return (await Promise.race([promise, timeout])) as T | null;
    } finally {
        if (timer) clearTimeout(timer);
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
        const mustAttestNow = trigger === 'pod_member_approved' || trigger === 'pod_participant_approved' || trigger === 'manual_assignment';
        if (mustAttestNow) {
            const easUid = await withTimeout(
                attestBadgeOnChain(result._id.toString(), walletAddress, slug, context),
                12000
            );
            if (easUid) {
                await Notification.create({
                    walletAddress: walletAddress.toLowerCase(),
                    type: 'badge_awarded',
                    title: 'Badge Attested! 🎉',
                    body: `Your ${badgeType.label} badge is now attested on-chain.`,
                    link: `/profile/${walletAddress.toLowerCase()}`,
                });
            }
        } else {
            attestBadgeOnChain(result._id.toString(), walletAddress, slug, context).catch(() => {});
        }
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
