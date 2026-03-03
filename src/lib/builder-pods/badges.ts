import { BadgeType } from '@/models/BadgeType';
import { UserBadge } from '@/models/UserBadge';

type BadgeTrigger =
    | 'lab_registration'
    | 'pod_member_approved'
    | 'showcase_finalist'
    | 'showcase_winner';

const triggerToSlug: Record<BadgeTrigger, string> = {
    lab_registration: 'builder_lab_participant',
    pod_member_approved: 'builder_pod_member',
    showcase_finalist: 'regional_showcase_finalist',
    showcase_winner: 'regional_showcase_winner',
};

export async function awardBadgeOnEvent(
    trigger: BadgeTrigger,
    walletAddress: string,
    context: { collegeId?: string; showcaseEventId?: string }
): Promise<void> {
    const slug = triggerToSlug[trigger];
    const badgeType = await BadgeType.findOne({ slug }).lean() as any;
    if (!badgeType) return;

    // Idempotent upsert — won't duplicate
    await UserBadge.findOneAndUpdate(
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
        { upsert: true }
    );
}

export async function assignBadgeManually(
    badgeSlug: string,
    walletAddress: string,
    assignedBy: string,
    context: { collegeId?: string; showcaseEventId?: string }
): Promise<void> {
    const badgeType = await BadgeType.findOne({ slug: badgeSlug }).lean() as any;
    if (!badgeType) throw new Error(`Badge type not found: ${badgeSlug}`);

    await UserBadge.findOneAndUpdate(
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
        { upsert: true }
    );
}
