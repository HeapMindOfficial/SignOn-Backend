import { UserModel } from '../models/user.model.js';
import type { UserIdentifiers } from '../types/user.types.js';

export async function findAllUserIdentifiers(): Promise<UserIdentifiers[]> {
  return UserModel.find().select('email username').lean();
}
