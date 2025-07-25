import * as emotionRepo from '../repositories/emotion.repository';
import { EmotionReport } from '../models/EmotionReport';
import { EmotionMetric } from '../models/EmotionMetric';
import { EmotionSummary } from '../models/EmotionSummary';
import { EmotionTimeline } from '../models/EmotionTimeline';
import { EmotionTransition } from '../models/EmotionTransition';

import { getEmotionReportByParticipant } from '../repositories/emotion.repository';

export const createReport = async (report: EmotionReport) =>
  emotionRepo.createEmotionReport(report);
export const addMetric = async (metric: EmotionMetric) =>
  emotionRepo.addEmotionMetric(metric);
export const addSummary = async (summary: EmotionSummary) =>
  emotionRepo.createEmotionSummary(summary);
export const addTimeline = async (event: EmotionTimeline) =>
  emotionRepo.addTimelineEvent(event);
export const addTransition = async (event: EmotionTransition) =>
  emotionRepo.addTransitionEvent(event);

export async function detectEmotionFromBase64(base64: string) {
  return {
    emotion: 'happy',
    percentages: {
      happy: 0.7,
      sad: 0.1,
      neutral: 0.2,
    },
  };
}

export async function processDetectedEmotion({
  sessionId,
  participantId,
  timestamp,
  emotionResult,
}: {
  sessionId: number;
  participantId: number;
  timestamp: Date;
  emotionResult: {
    emotion: string;
    percentages: Record<string, number>;
  };
}) {
  const primaryEmotionId = await getEmotionTypeIdByName(emotionResult.emotion);

  await addTimeline({
    id: 0,
    session_id: sessionId,
    timestamp,
    primary_emotion_id: primaryEmotionId,
  });

  const report = await getEmotionReportByParticipant(participantId);
  let reportId = report?.id;

  if (!reportId) {
    const [newId] = await createReport({
      id: 0,
      participant_id: participantId,
    });
    reportId = newId;
  }

  for (const [name, percentage] of Object.entries(emotionResult.percentages)) {
    const emotionTypeId = await getEmotionTypeIdByName(name);
    await addMetric({
      id: 0,
      emotion_report_id: reportId!,
      emotion_type_id: emotionTypeId,
      percentage,
      detected_at: timestamp,
    });
  }
}

async function getEmotionTypeIdByName(name: string): Promise<number> {
  const map: Record<string, number> = {
    happy: 1,
    sad: 2,
    neutral: 3,
    angry: 4,
    surprise: 5,
    fear: 6,
  };
  return map[name] ?? 3;
}
