import { Router } from 'express';
import { handleRegister } from '../controllers/user.controller';

const router = Router();

router.post('/', handleRegister);

export default router;
