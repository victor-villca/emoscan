import db from '../config/knex';
import { Session } from '../models/Session';

export const createSession = async (session: Omit<Session, 'id'>) => {
  const [created] = await db<Session>('sessions')
    .insert(session)
    .returning('*');
  return created;
};
export const getPaginatedSessionsByUser = async (
  userId: number,
  limit: number,
  offset: number
) => {
  return db('sessions as s')
    .leftJoin('participants as p', 's.id', 'p.session_id')
    .where('s.user_id', userId)
    .select('s.id', 's.name', 's.date', 's.start_time', 's.end_time')
    .count('p.id as participantCount')
    .groupBy('s.id')
    .orderBy('s.date', 'desc')
    .limit(limit)
    .offset(offset);
};

export const countUserSessions = async (userId: number): Promise<number> => {
  const result = await db('sessions')
    .where({ user_id: userId })
    .count<{ count: string }>({ count: '*' })
    .first();

  const count = result?.count || 0;
  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const getSessionsByUser = async (user_id: number) => {
  return db<Session>('sessions').where({ user_id }).returning('*');
};

export async function getSessionById(sessionId: number) {
  return db<Session>('sessions').where('id', sessionId).first().returning('*');
}

export async function getSessionByCode(code: string) {
  return db<Session>('sessions').where({ code }).first();
}

export async function updateSessionStatus(sessionId: number, status: string) {
  return db<Session>('sessions').where({ id: sessionId }).update({ status });
}