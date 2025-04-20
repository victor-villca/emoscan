import * as UserRepo from '../repositories/user.repository';
import { User } from '../models/User';

export async function registerUser(user: Omit<User, 'id'>): Promise<User> {
  const existing = await UserRepo.findUserByEmail(user.email);
  if (existing) return existing;
  return await UserRepo.createUser(user);
}
