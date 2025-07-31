import { Router } from 'express';
import { ingestFromClient } from '../controllers/ingest.controller';

const router = Router();

/**
 * @swagger
 * /emotions/ingest:
 *   post:
 *     summary: Ingests an image from the client for emotion detection
 *     tags: [Emotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - participantName
 *               - image
 *               - timestamp
 *             properties:
 *               code:
 *                 type: string
 *                 description: The session code.
 *               participantName:
 *                 type: string
 *                 description: The name of the participant.
 *               image:
 *                 type: string
 *                 format: base64
 *                 description: The base64 encoded image of a face.
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: The ISO 8601 timestamp of the capture.
 *     responses:
 *       200:
 *         description: Emotion detection result.
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Session not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/ingest', async (req, res) => {
  await ingestFromClient(req, res);
});

export default router;
