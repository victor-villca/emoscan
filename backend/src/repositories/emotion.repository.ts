import db from '../config/knex';
import { EmotionReport } from '../models/EmotionReport';
import { EmotionMetric } from '../models/EmotionMetric';
import { EmotionSummary } from '../models/EmotionSummary';
import { EmotionTimeline } from '../models/EmotionTimeline';
import { EmotionTransition } from '../models/EmotionTransition';

export const createEmotionReport = (report: EmotionReport) => {
  return db<EmotionReport>('emotion_reports').insert(report);
};

export const createEmotionReportReturning = async (
  report: Omit<EmotionReport, 'id'>
) => {
  const [created] = await db<EmotionReport>('emotion_reports')
    .insert(report)
    .returning('*');
  return created;
};

export const addEmotionMetric = (metric: Omit<EmotionMetric, 'id'>) => {
  return db<EmotionMetric>('emotion_metrics').insert(metric);
};

export const createEmotionSummary = (summary: EmotionSummary) => {
  return db<EmotionSummary>('emotion_summaries').insert(summary);
};

export const addTimelineEvent = (event: Omit<EmotionTimeline, 'id'>) => {
  return db<EmotionTimeline>('emotion_timelines').insert(event);
};

export const addTransitionEvent = (event: Omit<EmotionTransition, 'id'>) => {
  return db<EmotionTransition>('emotion_transitions').insert(event);
};

export async function getEmotionReportByParticipant(participantId: number) {
  return db<EmotionReport>('emotion_reports')
    .where('participant_id', participantId)
    .first();
}

export async function getEmotionMetrics(reportId: number) {
  return db<EmotionMetric>('emotion_metrics').where(
    'emotion_report_id',
    reportId
  );
}

export async function getEmotionSummary(sessionId: number) {
  return db<EmotionSummary>('emotion_summaries')
    .where('session_id', sessionId)
    .first();
}

export async function getEmotionTimeline(sessionId: number) {
  return db<EmotionTimeline>('emotion_timelines').where(
    'session_id',
    sessionId
  );
}

export async function getEmotionTransitions(sessionId: number) {
  return db<EmotionTransition>('emotion_transitions').where(
    'session_id',
    sessionId
  );
}

export async function upsertEmotionSummary(
  sessionId: number,
  totals: Omit<EmotionSummary, 'id' | 'session_id'>
) {
  const exists = await getEmotionSummary(sessionId);
  const payload = { session_id: sessionId, ...totals };

  if (!exists) {
    const [created] = await db<EmotionSummary>('emotion_summaries')
      .insert(payload)
      .returning('*');
    return created;
  } else {
    const [updated] = await db<EmotionSummary>('emotion_summaries')
      .where({ session_id: sessionId })
      .update(payload)
      .returning('*');
    return updated;
  }
}

export async function recomputeSessionSummary(sessionId: number) {
  const rows = (await db('emotion_metrics as em')
    .join('emotion_reports as er', 'er.id', 'em.emotion_report_id')
    .join('participants as p', 'p.id', 'er.participant_id')
    .where('p.session_id', sessionId)
    .groupBy('em.emotion_type_id')
    .select(
      'em.emotion_type_id',
      db.raw('AVG(em.percentage) as avg_percentage')
    )) as Array<{ emotion_type_id: number; avg_percentage: string | number }>;

  const totals = {
    happy: 0,
    sadness: 0,
    neutral: 0,
    angry: 0,
    surprise: 0,
    fear: 0,
  };

  const EMOTION_ID_TO_NAME: Record<number, keyof typeof totals> = {
    1: 'happy',
    2: 'sadness',
    3: 'neutral',
    4: 'angry',
    5: 'surprise',
    6: 'fear',
  };

  for (const row of rows) {
    const key = EMOTION_ID_TO_NAME[row.emotion_type_id];
    if (key) {
      totals[key] = parseFloat(Number(row.avg_percentage).toFixed(2)) || 0;
    }
  }
  return totals;
}

export const getOrCreateEmotionReport = async (
  participantId: number
): Promise<EmotionReport> => {
  let report = await db<EmotionReport>('emotion_reports')
    .where('participant_id', participantId)
    .first();

  if (!report) {
    const newReport = await createEmotionReportReturning({
      participant_id: participantId,
    });
    report = newReport;
  }

  return report;
};

export const getDominantEmotionIdForParticipant = async (
  participantId: number
): Promise<number | null> => {
  const result = await db('emotion_metrics as em')
    .join('emotion_reports as er', 'er.id', 'em.emotion_report_id')
    .where('er.participant_id', participantId)
    .select('em.emotion_type_id')
    .sum('em.percentage as total_percentage')
    .groupBy('em.emotion_type_id')
    .orderBy('total_percentage', 'desc')
    .first();

  return result ? result.emotion_type_id : null;
};
