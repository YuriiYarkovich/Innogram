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
import axios from 'axios';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

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
      const { data } = await axios.post(
        `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/validate`,
        {
          accessToken,
        },
      );

      context.set(CONTEXT_KEYS.USER, JSON.parse(data.user));
      return true;
    } catch (e) {
      console.warn('Access token invalid or expired:', e.response?.data);

      if (!refreshToken) {
        throw new UnauthorizedException(
          'Access token expired, and no refresh token found',
        );
      }

      try {
        const { data: refreshData } = await axios.post(
          `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        res.cookie('accessToken', refreshData.newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        });

        context.set(CONTEXT_KEYS.USER, refreshData.user);
        return true;
      } catch (e) {
        throw new InternalServerErrorException(e.message);
      }
    }
  }
}
