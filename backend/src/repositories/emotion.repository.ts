import db from '../config/knex';
import { EmotionReport } from '../models/EmotionReport';
import { EmotionMetric } from '../models/EmotionMetric';
import { EmotionSummary } from '../models/EmotionSummary';
import { EmotionTimeline } from '../models/EmotionTimeline';
import { EmotionTransition } from '../models/EmotionTransition';

export const createEmotionReport = (report: EmotionReport) => {
  return db<EmotionReport>('emotion_reports').insert(report);
};

export const addEmotionMetric = (metric: EmotionMetric) => {
  return db<EmotionMetric>('emotion_metrics').insert(metric);
};

export const createEmotionSummary = (summary: EmotionSummary) => {
  return db<EmotionSummary>('emotion_summaries').insert(summary);
};

export const addTimelineEvent = (event: EmotionTimeline) => {
  return db<EmotionTimeline>('emotion_timelines').insert(event);
};

export const addTransitionEvent = (event: EmotionTransition) => {
  return db<EmotionTransition>('emotion_transitions').insert(event);
};
export async function getEmotionReportByParticipant(participantId: number) {
    return db<EmotionReport>('emotion_reports').where('participant_id', participantId).first();
  }
  
  export async function getEmotionMetrics(reportId: number) {
    return db<EmotionMetric>('emotion_metrics').where('emotion_report_id', reportId);
  }
  
  export async function getEmotionSummary(sessionId: number) {
    return db<EmotionSummary>('emotion_summaries').where('session_id', sessionId).first();
  }
  
  export async function getEmotionTimeline(sessionId: number) {
    return db<EmotionTimeline>('emotion_timelines').where('session_id', sessionId);
  }
  
  export async function getEmotionTransitions(sessionId: number) {
    return db<EmotionTransition>('emotion_transitions').where('session_id', sessionId);
  }
  