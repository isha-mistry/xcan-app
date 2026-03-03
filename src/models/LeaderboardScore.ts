import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILeaderboardScore extends Document {
    collegeId: Types.ObjectId;
    totalDeployments: number;
    totalModuleCompletions: number;
    projectStatusScore: number;
    weeklyActivityScore: number;
    totalScore: number;
    activeMembersCount: number;
    totalMembersCount: number;
    rank: number | null;
    lastCalculatedAt: Date;
}

const LeaderboardScoreSchema = new Schema<ILeaderboardScore>(
    {
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, unique: true },
        totalDeployments: { type: Number, default: 0 },
        totalModuleCompletions: { type: Number, default: 0 },
        projectStatusScore: { type: Number, default: 0 },
        weeklyActivityScore: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        activeMembersCount: { type: Number, default: 0 },
        totalMembersCount: { type: Number, default: 0 },
        rank: { type: Number, default: null },
        lastCalculatedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

LeaderboardScoreSchema.index({ totalScore: -1 });
LeaderboardScoreSchema.index({ rank: 1 });

export const LeaderboardScore =
    mongoose.models.LeaderboardScore || mongoose.model<ILeaderboardScore>('LeaderboardScore', LeaderboardScoreSchema);
