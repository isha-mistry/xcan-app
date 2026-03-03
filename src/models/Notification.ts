import mongoose, { Document, Schema } from 'mongoose';

export const NOTIFICATION_TYPES = [
    'badge_awarded',
    'member_approved',
    'weekly_update_due',
    'deployment_verified',
    'showcase_result',
    'showcase_finalist',
    'showcase_winner',
    'project_status_changed',
    'role_assigned',
] as const;

export interface INotification extends Document {
    walletAddress: string;
    type: typeof NOTIFICATION_TYPES[number];
    title: string;
    body: string;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        walletAddress: { type: String, required: true, lowercase: true },
        type: { type: String, enum: NOTIFICATION_TYPES, required: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        link: { type: String, default: null },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// TTL — delete notifications after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
NotificationSchema.index({ walletAddress: 1 });
NotificationSchema.index({ walletAddress: 1, isRead: 1 });

export const Notification =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
