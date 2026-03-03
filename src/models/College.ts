import mongoose, { Document, Schema, Types } from 'mongoose';

export const COLLEGE_STATUS = ['active', 'inactive', 'alumni'] as const;
export const COLLEGE_TIER = ['tier1', 'tier2'] as const;

export interface ICollege extends Document {
    name: string;
    slug: string;
    city: string;
    state: string;
    stateCode: string;
    regionId: Types.ObjectId;
    regionSnapshot: {
        name: string;
        showcaseCity: string;
    };
    podName: string;
    facultyCoordinator: string | null;
    facultyEmail: string | null;
    facultyWallet: string | null;
    status: typeof COLLEGE_STATUS[number];
    tier: typeof COLLEGE_TIER[number];
    activatedAt: Date | null;
    batchYear: number;
    logoUrl: string | null;
    memberCount: number;
    activeMemberCount: number;
    projectCount: number;
    deploymentCount: number;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const CollegeSchema = new Schema<ICollege>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        stateCode: { type: String, required: true, uppercase: true, maxlength: 3 },
        regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
        regionSnapshot: {
            name: { type: String, required: true },
            showcaseCity: { type: String, required: true },
        },
        podName: { type: String, required: true },
        facultyCoordinator: { type: String, default: null },
        facultyEmail: { type: String, default: null, lowercase: true },
        facultyWallet: { type: String, default: null, lowercase: true },
        status: { type: String, enum: COLLEGE_STATUS, default: 'inactive' },
        tier: { type: String, enum: COLLEGE_TIER, default: 'tier2' },
        activatedAt: { type: Date, default: null },
        batchYear: { type: Number, default: () => new Date().getFullYear() },
        logoUrl: { type: String, default: null },
        memberCount: { type: Number, default: 0, min: 0 },
        activeMemberCount: { type: Number, default: 0, min: 0 },
        projectCount: { type: Number, default: 0, min: 0 },
        deploymentCount: { type: Number, default: 0, min: 0 },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

CollegeSchema.pre('save', async function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
});

export const College =
    mongoose.models.College || mongoose.model<ICollege>('College', CollegeSchema);
