import { LOCKOUT_DURATION_MS, MAX_FAILED_LOGIN_ATTEMPTS } from '../constants/auth.constants.js';
import { UserModel, type UserDocument } from '../models/user.model.js';
import type { CreateUserDTO } from '../types/auth.types.js';

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email: email.toLowerCase() });
}

export async function findUserById(id: string) {
  return UserModel.findById(id);
}

export async function findUserByUsername(username: string) {
  return UserModel.findOne({ username: username.toLowerCase() });
}

export async function findUserByIdentifier(identifier: string) {
  const normalized = identifier.toLowerCase();
  return UserModel.findOne({
    $or: [{ email: normalized }, { username: normalized }],
  }).select('+passwordHash');
}

export async function createUser(data: CreateUserDTO) {
  const user = new UserModel(data);
  await user.save();
  return user;
}

export async function recordFailedLogin(userId: string): Promise<void> {
  const user = await UserModel.findById(userId);
  if (!user) return;

  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    user.failedLoginAttempts = 0;
  }
  await user.save();
}

export async function recordSuccessfulLogin(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    $set: { failedLoginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockedUntil: '' },
  });
}

export async function updateUserById(
  userId: string,
  data: Partial<Pick<UserDocument, 'name' | 'givenName' | 'familyName' | 'picture' | 'status'>>,
) {
  return UserModel.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
}
