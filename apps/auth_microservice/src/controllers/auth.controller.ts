import { NextFunction, Request, Response } from 'express';
import { CreateAccountDto } from '../dto/create-account.dto.ts';
import { AuthService } from '../services/auth.service.ts';
import { LoginDto } from '../dto/login.dto.ts';

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
      return res.json(await this.authService.login(email, password));
    } catch (e) {
      next(e);
    }
  };

  googleAuthFailure = (req: Request, res: Response) => {
    res.send('Something went wrong!');
  };
}
