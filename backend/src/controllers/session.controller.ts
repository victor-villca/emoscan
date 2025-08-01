import { Request, Response } from 'express';
import * as SessionService from '../services/session.service';

export const getSessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 6;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    const sessionsData = await SessionService.listSessions(
      parseInt(userId),
      page,
      limit
    );

    res.json(sessionsData);
  } catch (error) {
    console.error('Error in getSessions controller:', error);
    res.status(500).json({ error: 'Error retrieving sessions' });
  }
};

export const getSessionReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const report = await SessionService.getFullSessionReport(
      parseInt(sessionId)
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving session report' });
  }
};

export const getParticipantReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { participantId } = req.params;
    const report = await SessionService.getParticipantReport(
      parseInt(participantId)
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving participant report' });
  }
};

export const createSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await SessionService.create(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error creating session' });
  }
};

export const getSessionByCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;
    const session = await SessionService.getSessionByCode(code);
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving session by code' });
  }
};

export const validateSessionCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;

    if (!code || code.trim() === '') {
      res.status(400).json({
        valid: false,
        message: 'Session code is required',
      });
      return;
    }

    const result = await SessionService.validateSessionCode(code.trim());

    if (result.valid) {
      res.json({
        valid: true,
        message: 'Session code is valid',
        session: result.session,
      });
    } else {
      res.status(404).json({
        valid: false,
        message: 'Invalid session code',
      });
    }
  } catch (error) {
    console.error('Error validating session code:', error);
    res.status(500).json({ error: 'Error validating session code' });
  }
};
