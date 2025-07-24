import { Router } from 'express';
import { getSessions, getSessionReport, getParticipantReport, createSession } from '../controllers/session.controller';

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

export default router;