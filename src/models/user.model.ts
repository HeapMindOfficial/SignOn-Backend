import { Schema, Types, model } from 'mongoose';

export type UserStatus =
  'pending_profile' | 'pending_verification' | 'active' | 'suspended' | 'deactivated';

export interface UserDocument {
  email: string;
  username: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;

  passwordHash: string;
  passwordChangedAt?: Date;

  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;

  status: UserStatus;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;

  roles: Types.ObjectId[];
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, required: true, default: false },
    emailVerifiedAt: { type: Date },

    passwordHash: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date },

    name: { type: String, trim: true },
    givenName: { type: String, trim: true },
    familyName: { type: String, trim: true },
    picture: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending_profile', 'pending_verification', 'active', 'suspended', 'deactivated'],
      required: true,
      default: 'pending_profile',
    },
    failedLoginAttempts: { type: Number, required: true, default: 0 },
    lockedUntil: { type: Date },
    lastLoginAt: { type: Date },

    roles: { type: [Schema.Types.ObjectId], ref: 'Role', required: true, default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.passwordHash;
      },
    },
  },
);

export const UserModel = model<UserDocument>('User', userSchema);
export type UserType = UserDocument;
