import axios from 'axios';
import dotenv from 'dotenv';
import { io } from '../config/socket';

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

const EMOTION_API_URL = process.env.EMOTION_API_URL || 'http://localhost:8000/api/model';
if (!EMOTION_API_URL) {
  throw new Error('EMOTION_API_URL is not defined in environment variables');
}

export async function forwardToFastApi(
  imageBase64: string
): Promise<FastApiResponse> {
  const resp = await axios.post<FastApiResponse>( EMOTION_API_URL, {
      image: imageBase64,
    });
  return resp.data;
}

export async function processIngestion(payload: IngestPayload) {
  const { imageBase64, sessionCode, participantName } = payload;
  const fastApiResult = await forwardToFastApi(imageBase64);
  if (io){
    const dataToEmit = {
      ...fastApiResult,
      participantName: participantName,
      timeStamp: new Date().toISOString(),
    };
    io.to(sessionCode).emit('new_emotion_data', dataToEmit);
    console.log(`📡 Emitted emotion data to room: ${sessionCode}`);
  }
  return fastApiResult;
}
