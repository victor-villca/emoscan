import db from '../config/knex';
import { Session } from '../models/Session';

export const createSession = async (session: Session) => {
  return db<Session>('sessions').insert(session).returning('*');
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
