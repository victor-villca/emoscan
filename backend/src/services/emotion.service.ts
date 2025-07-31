import axios from 'axios';
import {
  addTimelineEvent,
  createEmotionReportReturning,
  getEmotionReportByParticipant,
  upsertEmotionSummary,
  recomputeSessionSummary,
} from '../repositories/emotion.repository';
import { getOrCreateParticipant } from '../repositories/participant.repository';
import { ok } from 'assert';
import dotenv from 'dotenv';

dotenv.config();

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

const EMOTION_API_URL = process.env.EMOTION_API_URL;
if (!EMOTION_API_URL) {
  throw new Error('EMOTION_API_URL is not defined in environment variables');
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
  const { imageBase64 } = payload;

  const fastApiResult = await forwardToFastApi(imageBase64);
  return fastApiResult;
}
