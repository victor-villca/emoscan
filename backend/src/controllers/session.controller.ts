import { Request, Response } from 'express';
import * as SessionService from '../services/session.service';

export async function getSessions(req: Request, res: Response) {
  const userId = req.query.userId as string;
  const realUserId = parseInt(userId)
  const sessions = await SessionService.listSessions(realUserId);
  res.json(sessions);
}

export async function getSessionReport(req: Request, res: Response) {
const { sessionId } = req.params;
  const report = await SessionService.getFullSessionReport(parseInt(sessionId));
  res.json(report);
}

export async function getParticipantReport(req: Request, res: Response) {
  const { participantId } = req.params;
  const report = await SessionService.getParticipantReport(parseInt(participantId));
  res.json(report);
}

export async function createSession(req: Request, res: Response) {
    const result = await SessionService.create(req.body);
    res.json(result);
  }