import { Schema, Types, model } from 'mongoose';

export type VerificationTokenPurpose = 'email_verification' | 'password_reset';

export interface VerificationTokenDocument {
  userId: Types.ObjectId;
  tokenHash: string;
  purpose: VerificationTokenPurpose;
  expiresAt: Date;
  usedAt?: Date;
}

const verificationTokenSchema = new Schema<VerificationTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: true,
    },
    expiresAt: { type: Date, required: true, expires: 0 },
    usedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.tokenHash;
      },
    },
  },
);

export const VerificationTokenModel = model<VerificationTokenDocument>(
  'VerificationToken',
  verificationTokenSchema,
);
