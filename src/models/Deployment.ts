import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDeployment extends Document {
    walletAddress: string;
    collegeId: Types.ObjectId;
    projectId: Types.ObjectId | null;
    txHash: string;
    contractAddress: string | null;
    network: string;
    description: string | null;
    isVerified: boolean;
    verifiedBy: string | null;
    verifiedAt: Date | null;
    autoDetected: boolean;
    createdAt: Date;
}

const DeploymentSchema = new Schema<IDeployment>(
    {
        walletAddress: { type: String, required: true, lowercase: true },
        collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
        projectId: { type: Schema.Types.ObjectId, ref: 'PodProject', default: null },
        txHash: { type: String, required: true, unique: true, lowercase: true },
        contractAddress: { type: String, default: null, lowercase: true },
        network: { type: String, default: 'arbitrum_sepolia' },
        description: { type: String, default: null, maxlength: 500 },
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: String, default: null, lowercase: true },
        verifiedAt: { type: Date, default: null },
        autoDetected: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

DeploymentSchema.index({ walletAddress: 1 });
DeploymentSchema.index({ collegeId: 1 });
DeploymentSchema.index({ isVerified: 1 });

export const Deployment =
    mongoose.models.Deployment || mongoose.model<IDeployment>('Deployment', DeploymentSchema);
