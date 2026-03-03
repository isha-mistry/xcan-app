import mongoose, { Document, Schema, Types } from 'mongoose';

export const SHOWCASE_STATUS = ['upcoming', 'open', 'judging', 'completed'] as const;

export interface IShowcaseEvent extends Document {
    name: string;
    regionId: Types.ObjectId;
    regionSnapshot: { name: string; showcaseCity: string };
    city: string;
    eventDate: Date | null;
    venue: string | null;
    status: typeof SHOWCASE_STATUS[number];
    prizePoolUsd: number;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const ShowcaseEventSchema = new Schema<IShowcaseEvent>(
    {
        name: { type: String, required: true },
        regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
        regionSnapshot: {
            name: { type: String, required: true },
            showcaseCity: { type: String, required: true },
        },
        city: { type: String, required: true },
        eventDate: { type: Date, default: null },
        venue: { type: String, default: null },
        status: { type: String, enum: SHOWCASE_STATUS, default: 'upcoming' },
        prizePoolUsd: { type: Number, default: 1000 },
        createdBy: { type: String, default: null, lowercase: true },
    },
    { timestamps: true }
);

export const ShowcaseEvent =
    mongoose.models.ShowcaseEvent || mongoose.model<IShowcaseEvent>('ShowcaseEvent', ShowcaseEventSchema);
