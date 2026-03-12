import { Types } from 'mongoose';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { PodProject } from '@/models/PodProject';
import { Deployment } from '@/models/Deployment';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { LeaderboardScore } from '@/models/LeaderboardScore';

export const SCORE_WEIGHTS = {
    deployment: 10,
    stylusModule: 5,
    weeklyUpdate: 3,
    projectStatus: {
        ideation: 5,
        architecture_finalized: 15,
        prototype: 30,
        deployed: 50,
        demo_ready: 70,
    },
    individual: {
        moduleCompleted: 8,
        contractDeployed: 12,
        weeklyActivity: 3,
        projectContribution: 5,
    },
} as const;

/**
 * Recalculate a single member's totalScore inline after any field change.
 * Much cheaper than recalculating all members via cron.
 */
export async function recalculateMemberScore(memberId: string | Types.ObjectId): Promise<void> {
    const member = await PodMember.findById(memberId).lean() as any;
    if (!member) return;

    const score =
        (member.stylusModulesCompleted || 0) * SCORE_WEIGHTS.individual.moduleCompleted +
        (member.contractsDeployed || 0) * SCORE_WEIGHTS.individual.contractDeployed +
        (member.weeklyActivityScore || 0) * SCORE_WEIGHTS.individual.weeklyActivity +
        (member.projectContributionScore || 0) * SCORE_WEIGHTS.individual.projectContribution;

    await PodMember.updateOne({ _id: memberId }, { $set: { totalScore: score } });
}

/**
 * Recalculate a single pod's LeaderboardScore after changes to that college.
 * Avoids a full-table recalculation on every write.
 */
export async function recalculatePodScore(collegeId: string | Types.ObjectId): Promise<void> {
    const cid = typeof collegeId === 'string' ? new Types.ObjectId(collegeId) : collegeId;

    const [deploymentCount, moduleSum, projects, weeklyCount, memberCounts] = await Promise.all([
        Deployment.countDocuments({ collegeId: cid, isVerified: true }),
        PodMember.aggregate([
            { $match: { collegeId: cid, status: 'active' } },
            { $group: { _id: null, total: { $sum: '$stylusModulesCompleted' } } },
        ]),
        PodProject.find({ collegeId: cid, deletedAt: null }, 'status').lean(),
        WeeklyUpdate.countDocuments({ collegeId: cid, year: new Date().getFullYear() }),
        PodMember.aggregate([
            { $match: { collegeId: cid } },
            {
                $group: {
                    _id: null,
                    active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    total: { $sum: 1 },
                },
            },
        ]),
    ]);

    const deploymentScore = deploymentCount * SCORE_WEIGHTS.deployment;
    const moduleScore = (moduleSum[0]?.total ?? 0) * SCORE_WEIGHTS.stylusModule;
    const projectScore = projects.reduce(
        (acc: number, p: any) =>
            acc + (SCORE_WEIGHTS.projectStatus[p.status as keyof typeof SCORE_WEIGHTS.projectStatus] ?? 0),
        0
    );
    const weeklyScore = weeklyCount * SCORE_WEIGHTS.weeklyUpdate;
    const totalScore = deploymentScore + moduleScore + projectScore + weeklyScore;

    await LeaderboardScore.findOneAndUpdate(
        { collegeId: cid },
        {
            $set: {
                totalDeployments: deploymentCount,
                totalModuleCompletions: moduleSum[0]?.total ?? 0,
                projectStatusScore: projectScore,
                weeklyActivityScore: weeklyScore,
                totalScore,
                activeMembersCount: memberCounts[0]?.active ?? 0,
                totalMembersCount: memberCounts[0]?.total ?? 0,
                lastCalculatedAt: new Date(),
            },
        },
        { upsert: true }
    );
}

export async function recalculatePodLeaderboard(): Promise<void> {
    const colleges = await College.find({ status: 'active', deletedAt: null }, '_id').lean();

    for (const college of colleges) {
        const cid = college._id;

        const [deploymentCount, moduleSum, projects, weeklyCount, memberCounts] =
            await Promise.all([
                Deployment.countDocuments({ collegeId: cid, isVerified: true }),

                PodMember.aggregate([
                    { $match: { collegeId: cid, status: 'active' } },
                    { $group: { _id: null, total: { $sum: '$stylusModulesCompleted' } } },
                ]),

                PodProject.find({ collegeId: cid, deletedAt: null }, 'status').lean(),

                WeeklyUpdate.countDocuments({
                    collegeId: cid,
                    year: new Date().getFullYear(),
                }),

                PodMember.aggregate([
                    { $match: { collegeId: cid } },
                    {
                        $group: {
                            _id: null,
                            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                            total: { $sum: 1 },
                        },
                    },
                ]),
            ]);

        const deploymentScore = deploymentCount * SCORE_WEIGHTS.deployment;
        const moduleScore = (moduleSum[0]?.total ?? 0) * SCORE_WEIGHTS.stylusModule;
        const projectScore = projects.reduce(
            (acc: number, p: any) =>
                acc + (SCORE_WEIGHTS.projectStatus[p.status as keyof typeof SCORE_WEIGHTS.projectStatus] ?? 0),
            0
        );
        const weeklyScore = weeklyCount * SCORE_WEIGHTS.weeklyUpdate;
        const totalScore = deploymentScore + moduleScore + projectScore + weeklyScore;

        await LeaderboardScore.findOneAndUpdate(
            { collegeId: cid },
            {
                $set: {
                    totalDeployments: deploymentCount,
                    totalModuleCompletions: moduleSum[0]?.total ?? 0,
                    projectStatusScore: projectScore,
                    weeklyActivityScore: weeklyScore,
                    totalScore,
                    activeMembersCount: memberCounts[0]?.active ?? 0,
                    totalMembersCount: memberCounts[0]?.total ?? 0,
                    lastCalculatedAt: new Date(),
                },
            },
            { upsert: true }
        );
    }

    // Re-rank all pods after scores updated
    const allScores = await LeaderboardScore.find().sort({ totalScore: -1 }).lean();
    const bulkOps = allScores.map((s: any, idx: number) => ({
        updateOne: {
            filter: { _id: s._id },
            update: { $set: { rank: idx + 1 } },
        },
    }));
    if (bulkOps.length) await LeaderboardScore.bulkWrite(bulkOps);
}

export async function recalculateIndividualScores(): Promise<void> {
    const members = await PodMember.find({ status: 'active' }).lean();

    const bulkOps = members.map((m: any) => {
        const score =
            m.stylusModulesCompleted * SCORE_WEIGHTS.individual.moduleCompleted +
            m.contractsDeployed * SCORE_WEIGHTS.individual.contractDeployed +
            m.weeklyActivityScore * SCORE_WEIGHTS.individual.weeklyActivity +
            m.projectContributionScore * SCORE_WEIGHTS.individual.projectContribution;

        return {
            updateOne: {
                filter: { _id: m._id },
                update: { $set: { totalScore: score } },
            },
        };
    });

    if (bulkOps.length) await PodMember.bulkWrite(bulkOps);

    // Re-rank individuals globally
    const sorted = await PodMember.find({ status: 'active' })
        .sort({ totalScore: -1 })
        .select('_id')
        .lean();

    const rankOps = sorted.map((m: any, idx: number) => ({
        updateOne: {
            filter: { _id: m._id },
            update: { $set: { individualRank: idx + 1 } },
        },
    }));
    if (rankOps.length) await PodMember.bulkWrite(rankOps);
}
