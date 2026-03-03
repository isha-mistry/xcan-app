import mongoose, { Document, Schema, Types } from 'mongoose';
import crypto from 'crypto';

export interface ILabEvent extends Document {
    collegeId: Types.ObjectId;
    eventName: string;
    eventDate: Date;
    city: string;
    state: string;
    expectedAttendees: number | null;
    actualAttendees: number;
    qrToken: string;
    qrExpiresAt: Date | null;
    qrIsActive: boolean;
    milestoneNumber: number | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const LabEventSchema = new Schema<ILabEvent>(
    {
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        eventName: { type: String, required: true, trim: true },
        eventDate: { type: Date, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        expectedAttendees: { type: Number, default: null },
        actualAttendees: { type: Number, default: 0, min: 0 },
        qrToken: {
            type: String,
            required: true,
            unique: true,
            default: () => crypto.randomBytes(16).toString('hex'),
        },
        qrExpiresAt: { type: Date, default: null },
        qrIsActive: { type: Boolean, default: true },
        milestoneNumber: { type: Number, min: 1, max: 5, default: null },
        createdBy: { type: String, default: null, lowercase: true },
    },
    { timestamps: true }
);

LabEventSchema.index({ collegeId: 1 });

export const LabEvent =
    mongoose.models.LabEvent || mongoose.model<ILabEvent>('LabEvent', LabEventSchema);
