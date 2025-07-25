import { Request, Response } from 'express';
import {
  detectEmotionFromBase64,
  processDetectedEmotion,
} from '../services/emotion.service';

export async function handleEmotionDetection(req: Request, res: Response) {
  try {
    const { image, timestamp, sessionId, participantId } = req.body;

    if (!image || !timestamp || !sessionId || !participantId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const detectionResult = await detectEmotionFromBase64(image);
    await processDetectedEmotion({
      sessionId,
      participantId,
      timestamp: new Date(timestamp),
      emotionResult: detectionResult,
    });

    res
      .status(200)
      .json({ message: 'Emotion detected and saved', result: detectionResult });
  } catch (err) {
    console.error('[handleEmotionDetection]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
