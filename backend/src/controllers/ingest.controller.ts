import { Request, Response } from 'express';
import { processIngestion } from '../services/emotion.service';
import * as SessionRepo from '../repositories/session.repository';

export async function ingestFromClient(req: Request, res: Response) {
  try {
    const { code, participantName, image, timestamp } = req.body;

    if (!code || !participantName || !image || !timestamp) {
      return res.status(400).json({
        message: 'Missing fields: code, participantName, image, timestamp',
      });
    }

    const session = await SessionRepo.getSessionByCode(code);
    if (!session) {
      return res
        .status(404)
        .json({ message: `Session with code ${code} not found` });
    }

    const result = await processIngestion({
      sessionId: Number(session.id),
      participantName,
      imageBase64: image,
      timestamp: new Date(timestamp),
    });

    return res.status(200).json({ ok: true, result });
  } catch (e) {
    console.error('[ingestFromClient]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
}
