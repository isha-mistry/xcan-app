import mongoose, { Document, Schema } from 'mongoose';

export const BADGE_TRIGGER_EVENTS = [
    'lab_registration',
    'pod_member_approved',
    'manual_assignment',
    'showcase_finalist',
    'showcase_winner',
] as const;

export interface IBadgeType extends Document {
    slug: string;
    label: string;
    description: string;
    iconUrl: string | null;
    category: 'builder_pods' | 'general' | 'achievement';
    isAutoAwarded: boolean;
    triggerEvent: typeof BADGE_TRIGGER_EVENTS[number] | null;
    createdAt: Date;
}

const BadgeTypeSchema = new Schema<IBadgeType>(
    {
        slug: { type: String, required: true, unique: true },
        label: { type: String, required: true },
        description: { type: String, required: true },
        iconUrl: { type: String, default: null },
        category: { type: String, enum: ['builder_pods', 'general', 'achievement'], default: 'builder_pods' },
        isAutoAwarded: { type: Boolean, default: false },
        triggerEvent: { type: String, enum: [...BADGE_TRIGGER_EVENTS, null], default: null },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const BadgeType =
    mongoose.models.BadgeType || mongoose.model<IBadgeType>('BadgeType', BadgeTypeSchema);

export const BADGE_TYPE_SEED = [
    {
        slug: 'builder_lab_participant',
        label: 'Builder Lab Participant',
        description: 'Attended an Arbitrum Builder Lab on-campus event',
        isAutoAwarded: true,
        triggerEvent: 'lab_registration' as const,
    },
    {
        slug: 'builder_pod_member',
        label: 'Builder Pod Member',
        description: 'Active member of a university Arbitrum Builder Pod',
        isAutoAwarded: true,
        triggerEvent: 'pod_member_approved' as const,
    },
    {
        slug: 'builder_pod_lead',
        label: 'Builder Pod Lead',
        description: 'Tech Lead of a university Arbitrum Builder Pod',
        isAutoAwarded: false,
        triggerEvent: 'manual_assignment' as const,
    },
    {
        slug: 'regional_showcase_finalist',
        label: 'Regional Showcase Finalist',
        description: 'Selected as a finalist in a regional Arbitrum Showcase',
        isAutoAwarded: false,
        triggerEvent: 'showcase_finalist' as const,
    },
    {
        slug: 'regional_showcase_winner',
        label: 'Regional Showcase Winner',
        description: 'Winner of a regional Arbitrum Builder Pods Showcase',
        isAutoAwarded: false,
        triggerEvent: 'showcase_winner' as const,
    },
];
