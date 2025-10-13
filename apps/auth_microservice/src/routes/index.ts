import dotenv from 'dotenv';
import { join } from 'path';
import Router from 'express';

dotenv.config({ path: join(__dirname, '..', '..', '..', '.env') });

const router = Router();

router.use(`/auth`, authRouter);

export default router;
