import mongoose, { Document, Schema, Types } from 'mongoose';

export const SUBMISSION_STATUS = [
    'pending', 'approved', 'rejected', 'finalist', 'winner', 'special_mention',
] as const;

export const SUBMISSION_PLACEMENT = ['1st', '2nd', '3rd', 'special_mention'] as const;

export interface IShowcaseSubmission extends Document {
    showcaseEventId: Types.ObjectId;
    collegeId: Types.ObjectId;
    projectId: Types.ObjectId;
    collegeSnapshot: { name: string; slug: string; podName: string };
    projectSnapshot: { name: string; problemStatement: string };
    demoLink: string | null;
    githubRepo: string;
    contractAddress: string | null;
    pitchDeckUrl: string | null;
    submittedBy: string;
    status: typeof SUBMISSION_STATUS[number];
    placement: typeof SUBMISSION_PLACEMENT[number] | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    judgeNotes: string | null;
    prizeAmountUsd: number | null;
    createdAt: Date;
    updatedAt: Date;
}

const ShowcaseSubmissionSchema = new Schema<IShowcaseSubmission>(
    {
        showcaseEventId: { type: Schema.Types.ObjectId, ref: 'ShowcaseEvent', required: true },
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        projectId: { type: Schema.Types.ObjectId, ref: 'PodProject', required: true },
        collegeSnapshot: {
            name: { type: String, required: true },
            slug: { type: String, required: true },
            podName: { type: String, required: true },
        },
        projectSnapshot: {
            name: { type: String, required: true },
            problemStatement: { type: String, required: true },
        },
        demoLink: { type: String, default: null },
        githubRepo: { type: String, required: true },
        contractAddress: { type: String, default: null, lowercase: true },
        pitchDeckUrl: { type: String, default: null },
        submittedBy: { type: String, required: true, lowercase: true },
        status: { type: String, enum: SUBMISSION_STATUS, default: 'pending' },
        placement: { type: String, enum: [...SUBMISSION_PLACEMENT, null], default: null },
        reviewedBy: { type: String, default: null, lowercase: true },
        reviewedAt: { type: Date, default: null },
        judgeNotes: { type: String, default: null },
        prizeAmountUsd: { type: Number, default: null },
    },
    { timestamps: true }
);

// One submission per college per project per showcase
ShowcaseSubmissionSchema.index(
    { showcaseEventId: 1, collegeId: 1, projectId: 1 },
    { unique: true }
);

export const ShowcaseSubmission =
    mongoose.models.ShowcaseSubmission ||
    mongoose.model<IShowcaseSubmission>('ShowcaseSubmission', ShowcaseSubmissionSchema);
