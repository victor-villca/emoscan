import db from '../config/knex';
import { User } from '../models/User';

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const [createdUser] = await db<User>('users').insert(user).returning('*');
  return createdUser;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await db<User>('users').where({ email }).first();
  return user || null;
}
