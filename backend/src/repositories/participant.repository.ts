import db from '../config/knex';
import { Participant } from '../models/Participant';

export const createParticipant = async (participant: Participant) => {
  return db<Participant>('participants').insert(participant);
};

export const getParticipantsBySession = async (session_id: number) => {
  return db<Participant>('participants').where({ session_id });
};
export async function getParticipantById(id: number) {
    return db<Participant>('participants').where('id', id).first();
  }