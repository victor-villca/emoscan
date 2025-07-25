import { Router } from 'express';
import * as participantService from '../services/participant.service';

const router = Router();

router.post('/', async (req, res) => {
  const result = await participantService.create(req.body);
  res.json(result);
});

router.get('/session/:sessionId', async (req, res) => {
  const participants = await participantService.getBySession(
    parseInt(req.params.sessionId)
  );
  res.json(participants);
});
export default router;
