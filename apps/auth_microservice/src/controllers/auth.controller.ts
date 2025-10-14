import { Request, Response } from 'express';
import { CreateAccountDto } from '../dto/create-account.dto';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';

export class AuthController {
  readonly authService: AuthService = new AuthService();

  registerUsingEmailPassword = async (
    req: Request<CreateAccountDto>,
    res: Response,
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
      ),
    );
  };

  loginUsingEmailPassword = async (req: Request<LoginDto>, res: Response) => {
    const { email, password } = req.body;
    return res.json(await this.authService.login(email, password));
  };
}
