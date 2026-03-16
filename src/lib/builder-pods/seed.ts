import { dbConnect } from '@/lib/dbConnect';
import { Region, REGION_SEED } from '@/models/Region';
import { BadgeType, BADGE_TYPE_SEED } from '@/models/BadgeType';
import { PlatformRole, PLATFORM_ROLE_SEED } from '@/models/PlatformRole';
import { ProgramMilestone, MILESTONE_SEED } from '@/models/ProgramMilestone';
import { ShowcaseEvent } from '@/models/ShowcaseEvent';

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
    showcases: number;
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

    // Regional showcase events
    let showcasesInserted = 0;
    const regionalNames = ['Mumbai Regional Showcase', 'Ahmedabad Regional Showcase', 'Central India Regional Showcase'];
    const regions = await Region.find({ name: { $in: ['Mumbai Zone', 'Ahmedabad Zone', 'Central Zone'] } }).lean();

    for (const regionalName of regionalNames) {
        const existing = await ShowcaseEvent.findOne({ name: regionalName });
        if (existing) continue;

        const targetRegionName =
            regionalName.startsWith('Mumbai') ? 'Mumbai Zone' :
            regionalName.startsWith('Ahmedabad') ? 'Ahmedabad Zone' :
            'Central Zone';

        const region = regions.find((r) => r.name === targetRegionName);
        if (!region) continue;

        await ShowcaseEvent.create({
            name: regionalName,
            regionId: region._id,
            regionSnapshot: {
                name: region.name,
                showcaseCity: region.showcaseCity,
            },
            city: region.showcaseCity,
            eventDate: null,
            venue: null,
            status: 'open',
            prizePoolUsd: 1000,
            createdBy: null,
        });
        showcasesInserted++;
    }

    return {
        regions: regionsInserted,
        badges: badgesInserted,
        roles: rolesInserted,
        milestones: milestonesInserted,
        showcases: showcasesInserted,
    };
}
