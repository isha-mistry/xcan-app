import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
    actorWallet: string;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValue: Record<string, any> | null;
    newValue: Record<string, any> | null;
    ipAddress: string | null;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        actorWallet: { type: String, required: true, lowercase: true },
        action: { type: String, required: true },
        entityType: { type: String, required: true },
        entityId: { type: String, default: null },
        oldValue: { type: Schema.Types.Mixed, default: null },
        newValue: { type: Schema.Types.Mixed, default: null },
        ipAddress: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// TTL index — auto-delete audit logs after 1 year
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
AuditLogSchema.index({ actorWallet: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
