import * as SessionRepo from '../repositories/session.repository';
import * as ParticipantRepo from '../repositories/participant.repository';
import * as EmotionRepo from '../repositories/emotion.repository';
import { Session } from '../models/Session';
import { differenceInMinutes } from 'date-fns';

export const create = async (session: Omit<Session, 'id'>) =>
  SessionRepo.createSession(session);

export const getByUser = async (user_id: number) =>
  SessionRepo.getSessionsByUser(user_id);

export async function listSessions(
  userId: number,
  page: number,
  limit: number
) {
  const offset = (page - 1) * limit;

  const [totalSessions, sessions] = await Promise.all([
    SessionRepo.countUserSessions(userId),
    SessionRepo.getPaginatedSessionsByUser(userId, limit, offset),
  ]);

  const enrichedSessions = sessions.map((session: any) => {
    const start = new Date(`${session.date}T${session.start_time}`);
    const end = new Date(`${session.date}T${session.end_time}`);
    const durationMinutes = differenceInMinutes(end, start);

    return {
      ...session,
      participantCount: parseInt(session.participantCount, 10),
      durationMinutes,
    };
  });

  return {
    sessions: enrichedSessions,
    totalPages: Math.ceil(totalSessions / limit),
    currentPage: page,
  };
}

export async function getFullSessionReport(sessionId: number) {
  const session = await SessionRepo.getSessionById(sessionId);
  if (!session) return null;
  const participants =
    await ParticipantRepo.getParticipantsBySession(sessionId);
  const enrichedParticipants = await Promise.all(
    participants.map(async (participant) => {
      const dominantEmotionId =
        await EmotionRepo.getDominantEmotionIdForParticipant(participant.id);
      return { ...participant, dominantEmotionId };
    })
  );

  const summary = await EmotionRepo.getEmotionSummary(sessionId);
  const timeline = await EmotionRepo.getEmotionTimeline(sessionId);

  const transitions = await EmotionRepo.getEmotionTransitions(sessionId);

  return {
    session,
    participants: enrichedParticipants,
    emotionSummary: summary,
    timeline,
    transitions,
  };
}

export async function getParticipantsForSession(sessionId: number) {
  return ParticipantRepo.getParticipantsBySession(sessionId);
}

export async function getParticipantReport(participantId: number) {
  const participant = await ParticipantRepo.getParticipantById(participantId);
  const report = await EmotionRepo.getEmotionReportByParticipant(participantId);

  if (!report) {
    return {
      participant,
      emotionReport: null,
    };
  }

  const metrics = await EmotionRepo.getEmotionMetrics(report.id);

  return {
    participant,
    emotionReport: {
      ...report,
      emotions: metrics,
    },
  };
}

export async function getSessionByCode(code: string) {
  return SessionRepo.getSessionByCode(code);
}

export async function validateSessionCode(code: string) {
  try {
    const session = await SessionRepo.getSessionByCode(code);

    if (!session) {
      return {
        valid: false,
      };
    }

    return {
      valid: true,
      session: {
        id: session.id,
        name: session.name,
        code: session.code,
        date: session.date,
        start_time: session.start_time,
        end_time: session.end_time,
      },
    };
  } catch (error) {
    console.error('Error in validateSessionCode service:', error);
    throw error;
  }
}
