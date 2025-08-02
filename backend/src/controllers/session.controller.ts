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
    const sessionId = parseInt(req.params.sessionId, 10);
    // 1. Validación de Entrada
    if (isNaN(sessionId)) {
      res
        .status(400)
        .json({ message: 'Invalid session ID format. Must be a number.' });
      return;
    }

    const report = await SessionService.getFullSessionReport(sessionId);
    // 2. Manejo de 404
    if (!report) {
      res
        .status(404)
        .json({ message: `Session with ID ${sessionId} not found.` });
      return;
    }
    res.json(report);
  } catch (error) {
    console.error(`[getSessionReport] Error:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSessionParticipants = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);
    if (isNaN(sessionId)) {
      res
        .status(400)
        .json({ message: 'Invalid session ID format. Must be a number.' });
      return;
    }

    const participants =
      await SessionService.getParticipantsForSession(sessionId);
    res.json(participants);
  } catch (error) {
    console.error(`[getSessionParticipants] Error:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getParticipantReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const participantId = parseInt(req.params.participantId, 10);
    if (isNaN(participantId)) {
      res
        .status(400)
        .json({ message: 'Invalid participant ID format. Must be a number.' });
      return;
    }

    const report = await SessionService.getParticipantReport(participantId);
    if (!report) {
      res
        .status(404)
        .json({ message: `Participant with ID ${participantId} not found.` });
      return;
    }
    res.json(report);
  } catch (error) {
    console.error(`[getParticipantReport] Error:`, error);
    res.status(500).json({ message: 'Internal server error' });
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

export const handleFinishSession = async (
  req: Request, 
  res: Response
): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);
    if (isNaN(sessionId)) {
      res.status(400).json({ message: 'Invalid session ID.' });
      return;
    }
    const result = await SessionService.finishSession(sessionId);
    res.status(200).json(result);
  } catch (error) {
    console.error(`[handleFinishSession] Error:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};