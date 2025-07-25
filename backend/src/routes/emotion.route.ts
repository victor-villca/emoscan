import { Router } from 'express';
import * as emotionService from '../services/emotion.service';
import { handleEmotionDetection } from '../controllers/emotion.controller';
import { ingestFromClient } from '../controllers/ingest.controller';

const router = Router();

router.post('/report', async (req, res) => {
  const result = await emotionService.createReport(req.body);
  res.json(result);
});

router.post('/metric', async (req, res) => {
  const result = await emotionService.addMetric(req.body);
  res.json(result);
});

router.post('/summary', async (req, res) => {
  const result = await emotionService.addSummary(req.body);
  res.json(result);
});

router.post('/timeline', async (req, res) => {
  const result = await emotionService.addTimeline(req.body);
  res.json(result);
});

router.post('/transition', async (req, res) => {
  const result = await emotionService.addTransition(req.body);
  res.json(result);
});

router.post('/detect', async (req, res) => {
  const result = await handleEmotionDetection(req, res);
  res.json(result);
});

router.post('/ingest', async (req, res) => {
  await ingestFromClient(req, res);
});

export default router;
