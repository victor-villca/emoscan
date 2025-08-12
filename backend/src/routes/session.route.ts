import { Router } from 'express';
import {
  getSessions,
  getSessionReport,
  getParticipantReport,
  createSession,
  getSessionByCode,
  validateSessionCode,
  getSessionParticipants,
  handleFinishSession,
} from '../controllers/session.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Endpoints relacionados con sesiones
 */

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Crea una nueva sesión
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - name
 *               - date
 *               - start_time
 *               - end_time
 *             properties:
 *               user_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 example: "09:45"
 *     responses:
 *       200:
 *         description: Sesión creada exitosamente
 */
router.post('/', createSession);

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Obtiene todas las sesiones de un usuario
 *     tags: [Sessions]
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de sesiones
 */
router.get('/', getSessions);

router.get('/code/:code', getSessionByCode);
/**
 * @swagger
 * /sessions/validate/{code}:
 *   get:
 *     summary: Valida si un código de sesión existe y es válido
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Código de la sesión a validar
 *         example: "ABC123"
 *     responses:
 *       200:
 *         description: Código válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Session code is valid"
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     date:
 *                       type: string
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *       404:
 *         description: Código inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid session code"
 *       400:
 *         description: Código requerido
 *       500:
 *         description: Error del servidor
 */
router.get('/validate/:code', validateSessionCode);

router.get('/:sessionId/participants', getSessionParticipants);

/**
 * @swagger
 * /sessions/participant/{participantId}:
 *   get:
 *     summary: Obtiene el reporte emocional de un participante
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: participantId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Reporte emocional por participante
 */
router.get('/participant/:participantId', getParticipantReport);
/**
 * @swagger
 * /sessions/{sessionId}:
 *   get:
 *     summary: Obtiene el reporte completo de una sesión
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Reporte de sesión
 */
router.get('/:sessionId', getSessionReport);
router.post('/:sessionId/finish', handleFinishSession);

export default router;
