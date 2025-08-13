import { Router } from 'express';
import { handleStatusUpdate } from '../controllers/status.controller';

const router = Router();

router.post('/', handleStatusUpdate);

export default router;