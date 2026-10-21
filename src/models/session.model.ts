import { Schema, Types, model } from 'mongoose';

export interface SessionDocument {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  clientId?: Types.ObjectId;
  scopes?: string[];
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true, select: false },
    clientId: { type: Schema.Types.ObjectId, ref: 'Application' },
    scopes: { type: [String] },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true, expires: 0 },
    revokedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.refreshTokenHash;
      },
    },
  },
);

export const SessionModel = model<SessionDocument>('Session', sessionSchema);
