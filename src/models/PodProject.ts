import mongoose, { Document, Schema, Types } from 'mongoose';
import crypto from 'crypto';

export const PROJECT_STATUS = [
    'ideation',
    'architecture_finalized',
    'prototype',
    'deployed',
    'demo_ready',
] as const;

export interface IProjectTeamMember {
    walletAddress: string;
    name: string;
    role: 'team_leader' | 'team_member';
    joinedAt: Date;
}

export interface IPodProject extends Document {
    collegeId: Types.ObjectId;
    name: string;
    problemStatement: string;
    githubRepo: string | null;
    contractAddress: string | null;
    demoLink: string | null;
    techStack: string[];
    status: typeof PROJECT_STATUS[number];
    statusUpdatedBy: string | null;
    statusUpdatedAt: Date | null;
    isApproved: boolean;
    approvedBy: string | null;
    approvedAt: Date | null;
    submittedToShowcase: boolean;
    createdBy: string;
    teamCode: string;
    teamLeader: string;
    teamMembers: IProjectTeamMember[];
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectTeamMemberSchema = new Schema<IProjectTeamMember>(
    {
        walletAddress: { type: String, required: true, lowercase: true },
        name: { type: String, required: true, trim: true },
        role: { type: String, enum: ['team_leader', 'team_member'], default: 'team_member' },
        joinedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const PodProjectSchema = new Schema<IPodProject>(
    {
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        name: { type: String, required: true, trim: true },
        problemStatement: {
            type: String,
            trim: true,
            default: "",
            required: false,
        },
        githubRepo: { type: String, default: null },
        contractAddress: { type: String, default: null, lowercase: true },
        demoLink: { type: String, default: null },
        techStack: { type: [String], default: [] },
        status: { type: String, enum: PROJECT_STATUS, default: 'ideation' },
        statusUpdatedBy: { type: String, default: null, lowercase: true },
        statusUpdatedAt: { type: Date, default: null },
        isApproved: { type: Boolean, default: false },
        approvedBy: { type: String, default: null, lowercase: true },
        approvedAt: { type: Date, default: null },
        submittedToShowcase: { type: Boolean, default: false },
        createdBy: { type: String, required: true, lowercase: true },
        teamCode: {
            type: String,
            required: true,
            unique: true,
            default: () => crypto.randomBytes(4).toString('hex').toUpperCase(),
        },
        teamLeader: { type: String, required: true, lowercase: true },
        teamMembers: { type: [ProjectTeamMemberSchema], default: [] },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

PodProjectSchema.index({ collegeId: 1 });
PodProjectSchema.index({ status: 1 });
PodProjectSchema.index({ teamCode: 1 }, { unique: true });

export const PodProject = (() => {
    // In Next.js dev, the mongoose model cache can survive hot reloads and keep
    // stale validators (e.g. problemStatement still marked required).
    if (process.env.NODE_ENV !== "production" && mongoose.models.PodProject) {
        delete mongoose.models.PodProject;
    }
    return (
        mongoose.models.PodProject ||
        mongoose.model<IPodProject>("PodProject", PodProjectSchema)
    );
})();
