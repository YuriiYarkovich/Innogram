import { Router } from 'express';
const router: Router = Router();
import { AuthController } from '../controllers/auth.controller.ts';
import passport from 'passport';
import '../strategies/google-oauth.strategy.ts';
import { validateRegistrationData } from '../middleware/registration-data-validation.middleware.ts';
import { validateLoginData } from '../middleware/login-data-validation.middleware.ts';
import '../config/load-env.config.ts';

const authController = new AuthController();
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
router.post('/refresh', authController.refreshToken);
router.post('/validate', authController.validateToken);
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

router.get('/google/success', authController.googleSuccess);

router.get('/google/failure', authController.googleAuthFailure);

export default router;
