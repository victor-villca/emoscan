import axios from 'axios';
import {
  addEmotionMetric,
  addTimelineEvent,
  createEmotionReportReturning,
  getEmotionReportByParticipant,
  upsertEmotionSummary,
  recomputeSessionSummary,
} from '../repositories/emotion.repository';
import { getOrCreateParticipant } from '../repositories/participant.repository';

type FastApiResponse = {
  primary_emotion: string;
  primary_confidence: number;
  confidences: Record<string, number>;
};

type IngestPayload = {
  sessionId: number;
  participantName: string;
  timestamp: Date;
  imageBase64: string;
};

const EMOTION_NAME_TO_ID: Record<string, number> = {
  happy: 1,
  sadness: 2,
  neutral: 3,
  angry: 4,
  surprise: 5,
  fear: 6,
};

function mapEmotionToId(name: string) {
  return EMOTION_NAME_TO_ID[name.toLowerCase()] ?? 3;
}

export async function forwardToFastApi(
  imageBase64: string
): Promise<FastApiResponse> {
  const resp = await axios.post<FastApiResponse>(
    'http://localhost:8000/api/model',
    {
      image: imageBase64,
    }
  );
  return resp.data;
}

export async function processIngestion(payload: IngestPayload) {
  const { sessionId, participantName, timestamp, imageBase64 } = payload;

  const fastApi = await forwardToFastApi(imageBase64);

  const participant = await getOrCreateParticipant(sessionId, participantName);

  let report = await getEmotionReportByParticipant(participant.id);
  if (!report) {
    report = await createEmotionReportReturning({
      id: 0 as any,
      participant_id: participant.id,
    });
  }

  const primaryEmotionId = mapEmotionToId(fastApi.primary_emotion);
  await addTimelineEvent({
    id: undefined as any,
    session_id: sessionId,
    timestamp,
    primary_emotion_id: primaryEmotionId,
  });

  for (const [name, value] of Object.entries(fastApi.confidences)) {
    const emotion_type_id = mapEmotionToId(name);
    await addEmotionMetric({
      id: undefined as any,
      emotion_report_id: report.id,
      emotion_type_id,
      percentage: Math.round(value * 10000) / 100,
      detected_at: timestamp,
    });
  }

  const totals = await recomputeSessionSummary(sessionId);
  await upsertEmotionSummary(sessionId, totals);

  return {
    primary_emotion: fastApi.primary_emotion,
    confidences: fastApi.confidences,
  };
}

export * from './emotion.legacy';