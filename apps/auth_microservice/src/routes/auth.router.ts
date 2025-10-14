import { Router } from 'express';
const router = Router();
import { AuthController } from '../controllers/auth.controller';
import passport from '../strategies/google-oauth.strategy';

const authController = new AuthController();
router.post(`/registration`, authController.registerUsingEmailPassword);
router.post(`/login`, authController.loginUsingEmailPassword);
router.get(
  `/google`,
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);
router.get(`/google/callback`, passport.authenticate('google'), {
  successRedirect: '/protected',
  failureRedirect: '/auth/failure',
});

export default router;
