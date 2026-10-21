import type { HydratedDocument } from 'mongoose';

import type { UserDocument, UserType } from '../models/user.model.js';

export type CreateUserDTO = Pick<UserType, 'email' | 'username' | 'passwordHash'>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: HydratedDocument<UserDocument>;
}
