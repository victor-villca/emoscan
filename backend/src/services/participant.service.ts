import * as participantRepo from '../repositories/participant.repository';
import { Participant } from '../models/Participant';

export const create = async (participant: Participant) =>
  participantRepo.createParticipant(participant);
export const getBySession = async (session_id: number) =>
  participantRepo.getParticipantsBySession(session_id);
