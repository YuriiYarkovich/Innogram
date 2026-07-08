import { CookieOptions, Request, Response, NextFunction } from 'express';
import { CreateAccountDto } from '../dto/create-account.dto';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import '../config/load-env.config';
import { ApiError } from '../error/api.error';
import { requireEnv } from '../validation/env.validation';

function getCookieOptions(
  maxAge: number,
  sameSite: CookieOptions['sameSite'] = 'strict',
  includeDomain = false,
): CookieOptions {
  const secure = requireEnv('CLIENT_URL').startsWith('https://');
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? sameSite : 'lax',
    ...(secure && includeDomain ? { domain: requireEnv('DOMAIN') } : {}),
    maxAge,
  };
}

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
      res.cookie(
        'accessToken',
        tokens.accessToken,
        getCookieOptions(
          parseInt(requireEnv(`JWT_ACCESS_EXPIRES_IN`), 10) * 60 * 1000,
        ),
      );

      res.cookie(
        'refreshToken',
        tokens.refreshToken,
        getCookieOptions(
          parseInt(requireEnv(`JWT_REFRESH_EXPIRES_IN`), 10) * 60 * 1000,
        ),
      );
      return res.json(tokens);
    } catch (e) {
      next(e);
    }
  };

  googleSuccess(req, res) {
    const { accessToken, refreshToken } = req.user;

    res.cookie(
      'accessToken',
      accessToken,
      getCookieOptions(
        parseInt(requireEnv(`JWT_ACCESS_EXPIRES_IN`), 10) * 60 * 1000,
        'none',
        true,
      ),
    );
    res.cookie(
      'refreshToken',
      refreshToken,
      getCookieOptions(
        parseInt(requireEnv(`JWT_REFRESH_EXPIRES_IN`), 10) * 60 * 1000,
        'none',
        true,
      ),
    );

    const isProd = requireEnv('NODE_ENV') === 'production';
    const redirectUrl: string = isProd
      ? 'http://localhost/api/auth/googleSuccess'
      : `${requireEnv(`CORE_SERVICE_URL`)}/api/auth/googleSuccess`;

    return res.redirect(redirectUrl);
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

      res.cookie(
        'accessToken',
        tokens.accessToken,
        getCookieOptions(
          parseInt(requireEnv(`JWT_ACCESS_EXPIRES_IN`), 10) * 60 * 1000,
        ),
      );

      res.cookie(
        'refreshToken',
        tokens.refreshToken,
        getCookieOptions(
          parseInt(requireEnv(`JWT_REFRESH_EXPIRES_IN`), 10) * 60 * 1000,
        ),
      );
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

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const refreshToken: string = req.body.refreshToken;
      if (!refreshToken) {
        throw ApiError.unauthorized('No refresh token');
      }
      const refreshData =
        await this.authService.refreshAccessToken(refreshToken);
      res.cookie(
        'accessToken',
        refreshData.newAccessToken,
        getCookieOptions(15 * 60 * 1000),
      );
      return res.json(refreshData);
    } catch (e) {
      next(e);
    }
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      const accessToken: string | undefined = req.body?.accessToken;
      const refreshToken: string | undefined = req.body?.refreshToken;
      const result = await this.authService.validateOrRefreshTokens(
        accessToken,
        refreshToken,
      );
      if (result.newAccessToken) {
        res.cookie(
          'accessToken',
          result.newAccessToken,
          getCookieOptions(
            parseInt(requireEnv(`JWT_ACCESS_EXPIRES_IN`), 10) * 60 * 1000,
          ),
        );
      }
      return res.json({
        valid: true,
        user: result.user,
        ...(result.newAccessToken && {
          newAccessToken: result.newAccessToken,
        }),
      });
    } catch (e) {
      const statusCode: number =
        e instanceof ApiError ? e.statusCode : 401;
      const message: string = e instanceof Error ? e.message : 'Unauthorized';
      return res.status(statusCode).json({ valid: false, message });
    }
  };
}
