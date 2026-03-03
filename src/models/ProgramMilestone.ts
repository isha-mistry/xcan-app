import mongoose, { Document, Schema } from 'mongoose';

export interface IProgramMilestone extends Document {
    milestoneNumber: number;
    title: string;
    grantAmountUsd: number;
    targetLabs: number | null;
    targetPods: number | null;
    targetStudents: number | null;
    targetShowcases: number | null;
    status: 'not_started' | 'in_progress' | 'completed' | 'submitted';
    startedAt: Date | null;
    completedAt: Date | null;
    submittedAt: Date | null;
    notes: string | null;
    createdAt: Date;
}

const ProgramMilestoneSchema = new Schema<IProgramMilestone>(
    {
        milestoneNumber: { type: Number, required: true, unique: true, min: 1, max: 5 },
        title: { type: String, required: true },
        grantAmountUsd: { type: Number, required: true },
        targetLabs: { type: Number, default: null },
        targetPods: { type: Number, default: null },
        targetStudents: { type: Number, default: null },
        targetShowcases: { type: Number, default: null },
        status: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'submitted'],
            default: 'not_started',
        },
        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        submittedAt: { type: Date, default: null },
        notes: { type: String, default: null },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const ProgramMilestone =
    mongoose.models.ProgramMilestone ||
    mongoose.model<IProgramMilestone>('ProgramMilestone', ProgramMilestoneSchema);

export const MILESTONE_SEED = [
    { milestoneNumber: 1, title: 'First 6 Builder Labs & Pods', grantAmountUsd: 4000, targetLabs: 6, targetPods: 6, targetStudents: 500, targetShowcases: null },
    { milestoneNumber: 2, title: 'Next 6 Labs, Mentorship Start', grantAmountUsd: 4000, targetLabs: 12, targetPods: 12, targetStudents: 1000, targetShowcases: null },
    { milestoneNumber: 3, title: 'Final 6 Labs, Project Development', grantAmountUsd: 4000, targetLabs: 18, targetPods: 18, targetStudents: 1500, targetShowcases: null },
    { milestoneNumber: 4, title: 'Three Regional Showcases', grantAmountUsd: 5000, targetLabs: 18, targetPods: 18, targetStudents: null, targetShowcases: 3 },
    { milestoneNumber: 5, title: 'Final DAO Report & Sustainability Plan', grantAmountUsd: 4000, targetLabs: 18, targetPods: 18, targetStudents: 1500, targetShowcases: null },
];
