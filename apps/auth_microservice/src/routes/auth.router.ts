import { Router } from 'express';
const router = Router();
import { AuthController } from '../controllers/auth.controller.ts';
import passport from 'passport';
import { AuthService } from '../services/auth.service.ts';
import '../strategies/google-oauth.strategy.ts';
import { validateRegistrationData } from '../middleware/registration-data-validation.middleware.ts';
import { validateLoginData } from '../middleware/login-data-validation.middleware.ts';

const authController = new AuthController();
const authService = new AuthService();
router.post(
  `/registration`,
  validateRegistrationData,
  authController.registerUsingEmailPassword,
);
router.post(
  `/login`,
  validateLoginData,
  authController.loginUsingEmailPassword,
);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refreshToken);
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
