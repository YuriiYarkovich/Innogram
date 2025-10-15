import { Router } from 'express';
const router = Router();
import { AuthController } from '../controllers/auth.controller';
import passport from 'passport';
import { AuthService } from '../services/auth.service';
import '../strategies/google-oauth.strategy';

const authController = new AuthController();
const authService = new AuthService();
router.post(`/registration`, authController.registerUsingEmailPassword);
router.post(`/login`, authController.loginUsingEmailPassword);
router.get(
  `/google`,
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);
router.get(
  `/google/callback`,
  passport.authenticate('google', {
    successRedirect: '/api/auth/google/success',
    failureRedirect: '/api/auth/google/failure',
  }),
);

router.get(
  '/google/success',
  authService.isLoggedIn,
  authController.googleSuccess,
);

router.get('/google/failure', authController.googleAuthFailure);

export default router;
