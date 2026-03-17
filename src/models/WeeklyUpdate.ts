import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWeeklyUpdate extends Document {
    collegeId: Types.ObjectId;
    targetProjectId?: Types.ObjectId | null;
    submittedBy: string;
    weekNumber: number;
    year: number;
    completedThisWeek: string;
    blockers: string | null;
    nextMilestone: string;
    githubLink: string | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    reviewNote: string | null;
    deletedAt: Date | null;
    createdAt: Date;
}

const WeeklyUpdateSchema = new Schema<IWeeklyUpdate>(
    {
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        targetProjectId: { type: Schema.Types.ObjectId, ref: 'PodProject', default: null },
        submittedBy: { type: String, required: true, lowercase: true },
        weekNumber: { type: Number, required: true, min: 1, max: 53 },
        year: { type: Number, required: true },
        completedThisWeek: { type: String, required: true, maxlength: 2000 },
        blockers: { type: String, default: null, maxlength: 1000 },
        nextMilestone: { type: String, required: true, maxlength: 500 },
        githubLink: { type: String, default: null },
        reviewedBy: { type: String, default: null, lowercase: true },
        reviewedAt: { type: Date, default: null },
        reviewNote: { type: String, default: null },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

WeeklyUpdateSchema.index({ collegeId: 1, weekNumber: 1, year: 1, targetProjectId: 1 }, { unique: true });

export const WeeklyUpdate =
    mongoose.models.WeeklyUpdate || mongoose.model<IWeeklyUpdate>('WeeklyUpdate', WeeklyUpdateSchema);
