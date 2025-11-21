import { Request, Response, NextFunction } from 'express';
import { CreateAccountDto } from '../dto/create-account.dto.ts';
import { AuthService } from '../services/auth.service.ts';
import { LoginDto } from '../dto/login.dto.ts';
import '../config/load-env.config.ts';
import { ApiError } from '../error/api.error.ts';
import { requireEnv } from '../validation/env.validation.ts';

export class AuthController {
  readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  registerUsingEmailPassword = async (
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      CreateAccountDto
    >,

    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, bio, username, password, birthday } = req.body;

      const displayName: string = username;
      const deviceId: string | undefined = req.headers['x-device-id'] as string; // = req.deviceId;

      if (!deviceId) {
        return res.status(400).json({ message: 'Device ID required' });
      }

      const tokens: { accessToken: string; refreshToken: string } =
        await this.authService.register(
          email,
          password,
          username,
          displayName,
          birthday,
          bio,
          deviceId,
        );
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: parseInt(requireEnv(`JWT_ACCESS_EXPIRES_IN`), 10) * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: parseInt(requireEnv(`JWT_REFRESH_EXPIRES_IN`), 10) * 60 * 1000,
      });
      return res.json(tokens);
    } catch (e) {
      next(e);
    }
  };

  googleSuccess(req, res) {
    const { accessToken, refreshToken } = req.user;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: requireEnv('DOMAIN'),
      maxAge: parseInt(requireEnv(`JWT_ACCESS_EXPIRES_IN`), 10) * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: requireEnv('DOMAIN'),
      maxAge: parseInt(requireEnv(`JWT_REFRESH_EXPIRES_IN`), 10) * 60 * 1000,
    });

    return res.redirect(
      `${requireEnv(`CORE_SERVICE_URL`)}/api/auth/google/success`,
    );
  }

  loginUsingEmailPassword = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, LoginDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, password } = req.body;

      const deviceId: string | undefined = req.headers['x-device-id'] as string; // = req.deviceId;

      if (!deviceId) {
        return res.status(400).json({ message: 'Device ID required' });
      }

      const tokens = await this.authService.login(email, password, deviceId);

      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: parseInt(requireEnv(`JWT_ACCESS_EXPIRES_IN`), 10) * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: parseInt(requireEnv(`JWT_REFRESH_EXPIRES_IN`), 10) * 60 * 1000,
      });
      return res.json(tokens);
    } catch (e) {
      next(e);
    }
  };

  googleAuthFailure = (req: Request, res: Response) => {
    res.send('Something went wrong!');
  };

  logout = async (req: Request, res: Response) => {
    const result: boolean = await this.authService.logout(
      req.body.refreshToken,
    );
    res.json(
      result
        ? { message: 'Success' }
        : { message: 'No active sessions found for account' },
    );
  };

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken: string = req.body.refreshToken;
    if (!refreshToken) {
      throw ApiError.unauthorized('No refresh token');
    }

    const refreshData = await this.authService.refreshAccessToken(refreshToken);

    res.cookie('accessToken', refreshData.newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json(refreshData);
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      const token: string = req.body?.accessToken;
      const user = await this.authService.validateToken(token);
      return res.json({ valid: true, user });
    } catch (e) {
      return res.status(401).json({ valid: false, message: e.message });
    }
  };
}
