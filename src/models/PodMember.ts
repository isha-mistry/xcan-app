import mongoose, { Document, Schema, Types } from 'mongoose';

export const POD_MEMBER_ROLES = ['tech_lead', 'member', 'faculty', 'mentor'] as const;
export const POD_MEMBER_STATUS = ['pending', 'active', 'inactive', 'removed'] as const;

export interface IPodMember extends Document {
    collegeId: Types.ObjectId;
    walletAddress: string;
    name: string;
    role: typeof POD_MEMBER_ROLES[number];
    programmingLevel: 'beginner' | 'intermediate' | 'advanced' | null;
    githubUsername: string | null;
    status: typeof POD_MEMBER_STATUS[number];
    stylusModulesCompleted: number;
    contractsDeployed: number;
    weeklyActivityScore: number;
    projectContributionScore: number;
    totalScore: number;
    individualRank: number | null;
    approvedBy: string | null;
    approvedAt: Date | null;
    batchYear: number;
    semester: string | null;
    joinedViaQr: boolean;
    qrEventId: Types.ObjectId | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const PodMemberSchema = new Schema<IPodMember>(
    {
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        walletAddress: { type: String, required: true, lowercase: true },
        name: { type: String, required: true, trim: true },
        role: { type: String, enum: POD_MEMBER_ROLES, default: 'member' },
        programmingLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: null },
        githubUsername: { type: String, default: null },
        status: { type: String, enum: POD_MEMBER_STATUS, default: 'pending' },
        stylusModulesCompleted: { type: Number, default: 0, min: 0 },
        contractsDeployed: { type: Number, default: 0, min: 0 },
        weeklyActivityScore: { type: Number, default: 0, min: 0 },
        projectContributionScore: { type: Number, default: 0, min: 0 },
        totalScore: { type: Number, default: 0, min: 0 },
        individualRank: { type: Number, default: null },
        approvedBy: { type: String, default: null, lowercase: true },
        approvedAt: { type: Date, default: null },
        batchYear: { type: Number, default: () => new Date().getFullYear() },
        semester: { type: String, default: null },
        joinedViaQr: { type: Boolean, default: false },
        qrEventId: { type: Schema.Types.ObjectId, ref: 'LabEvent', default: null },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

PodMemberSchema.index({ collegeId: 1, walletAddress: 1 }, { unique: true });
PodMemberSchema.index({ walletAddress: 1 });
PodMemberSchema.index({ status: 1 });
PodMemberSchema.index({ totalScore: -1 });

export const PodMember =
    mongoose.models.PodMember || mongoose.model<IPodMember>('PodMember', PodMemberSchema);
