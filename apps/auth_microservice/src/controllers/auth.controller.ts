import { NextFunction, Request, Response } from 'express';
import { CreateAccountDto } from '../dto/create-account.dto.ts';
import { AuthService } from '../services/auth.service.ts';
import { LoginDto } from '../dto/login.dto.ts';
import '../config/load-env.config.ts';
import { ApiError } from '../error/api.error.ts';

export class AuthController {
  readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  registerUsingEmailPassword = async (
    req: Request<CreateAccountDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, bio, displayName, username, password, birthday } =
        req.body;
      const tokens = await this.authService.register(
        email,
        password,
        username,
        displayName,
        birthday,
        bio,
      );
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('In google success before redirecting');
    return res.redirect(
      `${process.env.CORE_SERVICE_URL}/api/auth/google/success?accessToken=${accessToken}`,
    );
  }

  loginUsingEmailPassword = async (
    req: Request<LoginDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, password } = req.body;
      console.log(`Data received in login method: ${email};    ${password}`);
      const tokens = await this.authService.login(email, password);
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
    res.json(
      (await this.authService.logout(req.body.token)) ? 'Success' : 'failed',
    );
  };

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      console.log('No refresh token in refresh token controller method!');
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

  validateToken = async (req, res) => {
    try {
      const token = req.body?.accessToken;
      const user = await this.authService.validateToken(token);
      return res.json({ valid: true, user: user });
    } catch (e) {
      console.log(e);
      return res.status(401).json({ valid: false, message: e.message });
    }
  };
}
