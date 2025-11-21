import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { context, CONTEXT_KEYS } from '../cls/request-context';
import { Request, Response } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { UserInAccessToken } from '../types/user.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(exContext: ExecutionContext): Promise<boolean> {
    const ctx: HttpArgumentsHost = exContext.switchToHttp();
    const req: Request = ctx.getRequest<Request>();
    const res: Response = ctx.getResponse<Response>();

    const accessToken: string = req.cookies?.accessToken;
    const refreshToken: string = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No tokens provided!');
    }

    try {
      const user: UserInAccessToken =
        await this.authService.validateAccessToken(accessToken);
      context.set(CONTEXT_KEYS.USER, user);
      return true;
    } catch (e) {
      console.warn('Access token invalid or expired:', e.response?.data);

      console.log(`Refresh token in guard: ${refreshToken}`);
      if (!refreshToken) {
        throw new UnauthorizedException(
          'Access token expired, and no refresh token found',
        );
      }

      try {
        const refreshData: { newAccessToken: string; user: unknown } =
          await this.authService.refreshAccessToken(refreshToken);

        res.cookie('accessToken', refreshData.newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        });

        console.log(
          `User before setting to context^ ${JSON.stringify(refreshData.user)}`,
        );

        context.set(CONTEXT_KEYS.USER, refreshData.user);
        return true;
      } catch (e) {
        throw new InternalServerErrorException(e.message);
      }
    }
  }
}
