import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserBadge extends Document {
    walletAddress: string;
    badgeTypeId: Types.ObjectId;
    badgeSnapshot: {
        slug: string;
        label: string;
        iconUrl: string | null;
    };
    collegeId: Types.ObjectId | null;
    showcaseEventId: Types.ObjectId | null;
    assignedBy: string | null;
    assignedAt: Date;
    onChainAttested: boolean;
    easUid: string | null;
    attestedAt: Date | null;
}

const UserBadgeSchema = new Schema<IUserBadge>(
    {
        walletAddress: { type: String, required: true, lowercase: true },
        badgeTypeId: { type: Schema.Types.ObjectId, ref: 'BadgeType', required: true },
        badgeSnapshot: {
            slug: { type: String, required: true },
            label: { type: String, required: true },
            iconUrl: { type: String, default: null },
        },
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', default: null },
        showcaseEventId: { type: Schema.Types.ObjectId, ref: 'ShowcaseEvent', default: null },
        assignedBy: { type: String, default: null, lowercase: true },
        assignedAt: { type: Date, default: Date.now },
        onChainAttested: { type: Boolean, default: false },
        easUid: { type: String, default: null },
        attestedAt: { type: Date, default: null },
    },
    { timestamps: false }
);

UserBadgeSchema.index({ walletAddress: 1 });
UserBadgeSchema.index({ badgeTypeId: 1 });
UserBadgeSchema.index(
    { walletAddress: 1, badgeTypeId: 1, collegeId: 1 },
    { unique: true, partialFilterExpression: { collegeId: { $ne: null } } }
);
UserBadgeSchema.index(
    { walletAddress: 1, badgeTypeId: 1 },
    { unique: true, partialFilterExpression: { collegeId: null } }
);

export const UserBadge =
    mongoose.models.UserBadge || mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
