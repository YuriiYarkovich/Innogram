import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { context, CONTEXT_KEYS } from '../cls/request-context';
import { Request, Response } from 'express';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

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
      console.log(`Sending access token on validation`);
      const url: string = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/validate`;
      const options = {
        method: 'POST',
        data: { accessToken },
      };
      const response = await this.authService.forwardRequest<{
        valid: boolean;
        user: { profile_id: string; role: string };
      }>(url, options);

      console.log(
        `Access token returned everything is fine. User: ${response.data.user}`,
      );
      context.set(CONTEXT_KEYS.USER, response.data.user);
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
        const url: string = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/refresh`;
        const options = {
          method: 'POST',
          data: { refreshToken },
          withCredentials: true,
        };
        const refreshData = await this.authService.forwardRequest<{
          user: { profileId: string; role: string };
          newAccessToken: string;
        }>(url, options);

        res.cookie('accessToken', refreshData.data.newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        });

        console.log(
          `User before setting to context^ ${JSON.stringify(refreshData.data.user)}`,
        );

        context.set(CONTEXT_KEYS.USER, refreshData.data.user);
        return true;
      } catch (e) {
        throw new InternalServerErrorException(e.message);
      }
    }
  }
}
