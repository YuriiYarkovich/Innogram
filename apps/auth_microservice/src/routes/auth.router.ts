import { Router } from 'express';
const router = Router();
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();
router.post(`/registration`, authController.registerUsingLogin);

export default router;
