import mongoose, { Document, Schema, Types } from 'mongoose';

export const PROJECT_STATUS = [
    'ideation',
    'architecture_finalized',
    'prototype',
    'deployed',
    'demo_ready',
] as const;

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
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const PodProjectSchema = new Schema<IPodProject>(
    {
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        name: { type: String, required: true, trim: true },
        problemStatement: { type: String, required: true, trim: true },
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
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

PodProjectSchema.index({ collegeId: 1 });
PodProjectSchema.index({ status: 1 });

export const PodProject =
    mongoose.models.PodProject || mongoose.model<IPodProject>('PodProject', PodProjectSchema);
