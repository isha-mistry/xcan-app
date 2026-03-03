import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── PlatformRole ───────────────────────────────────────────────────────────

export interface IPlatformRole extends Document {
    slug: string;
    label: string;
    description: string;
}

const PlatformRoleSchema = new Schema<IPlatformRole>(
    {
        slug: { type: String, required: true, unique: true },
        label: { type: String, required: true },
        description: { type: String, default: '' },
    },
    { timestamps: false }
);

export const PlatformRole =
    mongoose.models.PlatformRole || mongoose.model<IPlatformRole>('PlatformRole', PlatformRoleSchema);

export const PLATFORM_ROLE_SEED = [
    { slug: 'super_admin', label: 'Super Admin', description: 'Full platform access, all colleges' },
    { slug: 'college_admin', label: 'College Admin', description: 'Admin for a specific college Pod' },
    { slug: 'mentor', label: 'Mentor', description: 'Lampros DAO mentor assigned to Pods' },
    { slug: 'pod_lead', label: 'Pod Lead', description: 'Tech Lead - can submit updates' },
    { slug: 'pod_member', label: 'Pod Member', description: 'Active Pod member - can log deployments' },
    { slug: 'faculty_coordinator', label: 'Faculty Coordinator', description: 'View + approve local members' },
];

// ─── UserRole ────────────────────────────────────────────────────────────────

export interface IUserRole extends Document {
    walletAddress: string;
    roleSlug: string;
    roleId: Types.ObjectId;
    collegeId: Types.ObjectId | null;
    grantedBy: string | null;
    grantedAt: Date;
    revokedAt: Date | null;
}

const UserRoleSchema = new Schema<IUserRole>(
    {
        walletAddress: { type: String, required: true, lowercase: true },
        roleSlug: { type: String, required: true },
        roleId: { type: Schema.Types.ObjectId, ref: 'PlatformRole', required: true },
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', default: null },
        grantedBy: { type: String, default: null, lowercase: true },
        grantedAt: { type: Date, default: Date.now },
        revokedAt: { type: Date, default: null },
    },
    { timestamps: false }
);

UserRoleSchema.index({ walletAddress: 1, roleSlug: 1, collegeId: 1 }, { unique: true });
UserRoleSchema.index({ walletAddress: 1, revokedAt: 1 });

export const UserRole =
    mongoose.models.UserRole || mongoose.model<IUserRole>('UserRole', UserRoleSchema);
