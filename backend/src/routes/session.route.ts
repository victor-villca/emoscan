import { Router } from 'express';
import { getSessions, getSessionReport, getParticipantReport, createSession } from '../controllers/session.controller';

const router = Router();

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:sessionId', getSessionReport);
router.get('/participant/:participantId', getParticipantReport);

export default router;