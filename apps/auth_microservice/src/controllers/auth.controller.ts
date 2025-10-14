import { NextFunction, Request, Response } from 'express';
import { CreateAccountDto } from '../dto/create-account.dto';
import { AuthService } from '../services/auth.service';

export class AuthController {
  readonly authService: AuthService = new AuthService();

  registerUsingLogin = async (
    req: Request<CreateAccountDto>,
    res: Response,
    next: NextFunction,
  ) => {
    const { email, bio, displayName, username, password, birthday } = req.body;
    return res.json(
      await this.authService.register(
        email,
        password,
        username,
        displayName,
        birthday,
        bio,
        next,
      ),
    );
  };
}
