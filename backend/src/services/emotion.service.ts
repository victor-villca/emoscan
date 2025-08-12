import axios from 'axios';
import dotenv from 'dotenv';
import { io } from '../config/socket';
import { getOrCreateParticipant } from '../repositories/participant.repository';
import {
  getOrCreateEmotionReport,
  addTimelineEvent,
  addEmotionMetric,
  recomputeSessionSummary,
  upsertEmotionSummary,
} from '../repositories/emotion.repository';
import * as SessionRepo from '../repositories/session.repository';

dotenv.config();

type FastApiResponse = {
  primary_emotion: string;
  primary_confidence: number;
  confidences: Record<string, number>;
};

type IngestPayload = {
  sessionCode: string;
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

function mapEmotionToId(name: string): number {
  return EMOTION_NAME_TO_ID[name.toLowerCase()] ?? 3;
}

const EMOTION_API_URL =
  process.env.EMOTION_API_URL || 'http://localhost:8000/api/model';
if (!EMOTION_API_URL) {
  throw new Error('EMOTION_API_URL is not defined in environment variables');
}

export async function forwardToFastApi(
  imageBase64: string
): Promise<FastApiResponse> {
  const resp = await axios.post<FastApiResponse>(EMOTION_API_URL, {
    image: imageBase64,
  });
  return resp.data;
}

export async function processIngestion(payload: IngestPayload) {
  const { imageBase64, sessionCode, sessionId, participantName, timestamp } =
    payload;
  const fastApiResult = await forwardToFastApi(imageBase64);
  if (io) {
    const dataToEmit = {
      ...fastApiResult,
      participantName: participantName,
      timeStamp: new Date().toISOString(),
    };
    io.to(sessionCode).emit('new_emotion_data', dataToEmit);
    console.log(`📡 Emitted emotion data to room: ${sessionCode}`);

    try {
      const currentSession = await SessionRepo.getSessionById(sessionId);
      if (currentSession && !currentSession.actual_start_time) {
        await SessionRepo.updateSessionStartTime(sessionId, new Date());
        console.log(`✅ Registered actual_start_time for session ${sessionId}`);
      }

      const participant = await getOrCreateParticipant(
        sessionId,
        participantName,
        imageBase64
      );

      const report = await getOrCreateEmotionReport(participant.id);

      const primaryEmotionId = mapEmotionToId(fastApiResult.primary_emotion);
      await addTimelineEvent({
        session_id: sessionId,
        timestamp: timestamp,
        primary_emotion_id: primaryEmotionId,
      });

      for (const [name, confidence] of Object.entries(
        fastApiResult.confidences
      )) {
        const emotionTypeId = mapEmotionToId(name);
        if (emotionTypeId) {
          await addEmotionMetric({
            emotion_report_id: report.id,
            emotion_type_id: emotionTypeId,
            percentage: parseFloat((confidence * 100).toFixed(2)),
            detected_at: timestamp,
          });
        }
      }

      const totals = await recomputeSessionSummary(sessionId);
      await upsertEmotionSummary(sessionId, totals);

      console.log(`💾 Data persisted for participant: ${participant.name}`);
    } catch (dbError) {
      console.error('--- DATABASE ERROR ---');
      console.error(
        `Failed to persist emotion data for participant ${participantName} in session ${sessionId}.`
      );
      console.error(dbError);
      console.error('--- END DATABASE ERROR ---');
    }
  }
  return fastApiResult;
}
