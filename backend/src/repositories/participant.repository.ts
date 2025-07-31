import db from '../config/knex';
import { Participant } from '../models/Participant';

export const createParticipant = async (participant: Omit<Participant, 'id'>) => {
  const [created] = await db<Participant>('participants')
    .insert(participant)
    .returning('*');
  return created;
};

export const getParticipantsBySession = async (session_id: number) => {
  return db<Participant>('participants').where({ session_id });
};

export async function getParticipantById(id: number) {
  return db<Participant>('participants').where('id', id).first();
}

export async function getParticipantByName(session_id: number, name: string) {
  return db<Participant>('participants').where({ session_id, name }).first();
}

export async function getOrCreateParticipant(session_id: number, name: string) {
  const existing = await getParticipantByName(session_id, name);
  if (existing) return existing;

  const created = await createParticipant({ session_id, name });
  return created;
}