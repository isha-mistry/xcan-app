import { dbConnect } from '@/lib/dbConnect';
import { Region, REGION_SEED } from '@/models/Region';
import { BadgeType, BADGE_TYPE_SEED } from '@/models/BadgeType';
import { PlatformRole, PLATFORM_ROLE_SEED } from '@/models/PlatformRole';
import { ProgramMilestone, MILESTONE_SEED } from '@/models/ProgramMilestone';

/**
 * Seeds initial data for Builder Pods.
 * Idempotent — safe to run multiple times.
 * Call from an API route or startup script.
 */
export async function seedBuilderPods(): Promise<{
    regions: number;
    badges: number;
    roles: number;
    milestones: number;
}> {
    await dbConnect();

    // Regions
    let regionsInserted = 0;
    for (const seed of REGION_SEED) {
        const existing = await Region.findOne({ name: seed.name });
        if (!existing) {
            await Region.create(seed);
            regionsInserted++;
        }
    }

    // Badge types
    let badgesInserted = 0;
    for (const seed of BADGE_TYPE_SEED) {
        const existing = await BadgeType.findOne({ slug: seed.slug });
        if (!existing) {
            await BadgeType.create(seed);
            badgesInserted++;
        }
    }

    // Platform roles
    let rolesInserted = 0;
    for (const seed of PLATFORM_ROLE_SEED) {
        const existing = await PlatformRole.findOne({ slug: seed.slug });
        if (!existing) {
            await PlatformRole.create(seed);
            rolesInserted++;
        }
    }

    // Program milestones
    let milestonesInserted = 0;
    for (const seed of MILESTONE_SEED) {
        const existing = await ProgramMilestone.findOne({ milestoneNumber: seed.milestoneNumber });
        if (!existing) {
            await ProgramMilestone.create(seed);
            milestonesInserted++;
        }
    }

    return {
        regions: regionsInserted,
        badges: badgesInserted,
        roles: rolesInserted,
        milestones: milestonesInserted,
    };
}
