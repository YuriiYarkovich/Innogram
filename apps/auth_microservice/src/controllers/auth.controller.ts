import { NextFunction, Request, Response } from 'express';
import { CreateAccountDto } from '../dto/create-account.dto.ts';
import { AuthService } from '../services/auth.service.ts';
import { LoginDto } from '../dto/login.dto.ts';
import '../config/load-env.config.ts';
import { ApiError } from '../error/api.error.ts';

export class AuthController {
  readonly authService: AuthService = new AuthService();

  registerUsingEmailPassword = async (
    req: Request<CreateAccountDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, bio, displayName, username, password, birthday } =
        req.body;
      return res.json(
        await this.authService.register(
          email,
          password,
          username,
          displayName,
          birthday,
          bio,
        ),
      );
    } catch (e) {
      next(e);
    }
  };

  googleSuccess(req, res) {
    const user = req.user as any;
    const token = user?.token;

    if (!token) {
      return res.status(400).json({ message: 'Token not found' });
    }

    res.json({ token });
  }

  loginUsingEmailPassword = async (
    req: Request<LoginDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, password } = req.body;
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

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw ApiError.unauthorized('No refresh token');
    }

    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ newAccessToken: newAccessToken });
  }
}
