import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-account.dto';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { AuthResponseDto } from './dto/auth-response.dto';
import { GoogleResponseDto } from './dto/google-response.dto';
import { HttpService } from './httpService';
import { AuthService } from './auth.service';

@ApiTags('Authentication operations')
@ApiBearerAuth('access-token')
@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Authenticates users in system' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'accessToken and refreshToken are set as HttpOnly cookies',
        schema: {
          type: 'string',
          example:
            'accessToken=abc123; HttpOnly; Path=/; Secure, refreshToken=xyz789; HttpOnly; Path=/; Secure',
        },
      },
    },
  })
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const url = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/login`;

    const response = await this.httpService.forwardRequest<{
      accessToken: string;
      refreshToken: string;
    }>(url, {
      method: 'POST',
      data: dto,
      withCredentials: true,
      headers: { 'x-device-id': req.headers['x-device-id'] },
    });

    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.json({ message: ['success!'] });
  }

  @ApiOperation({ summary: 'Registers users in system' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'accessToken and refreshToken are set as HttpOnly cookies',
        schema: {
          type: 'string',
          example:
            'accessToken=abc123; HttpOnly; Path=/; Secure, refreshToken=xyz789; HttpOnly; Path=/; Secure',
        },
      },
    },
  })
  @Post('/registration')
  async registerUser(
    @Body() dto: CreateAccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const url: string = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/registration`;
    const options = {
      method: 'POST',
      data: dto,
      withCredentials: true,
      headers: {
        'x-device-id': req.headers['x-device-id'],
      },
    };

    const response = await this.httpService.forwardRequest<{
      accessToken: string;
      refreshToken: string;
    }>(url, options);

    const setCookie: string[] | undefined = response.headers?.['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.json({
      result: `Success!`,
    });
  }

  @ApiOperation({ summary: 'Registers users using google OAuth2' })
  @ApiResponse({
    status: 200,
    type: GoogleResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'accessToken and refreshToken are set as HttpOnly cookies',
        schema: {
          type: 'string',
          example:
            'accessToken=abc123; HttpOnly; Path=/; Secure, refreshToken=xyz789; HttpOnly; Path=/; Secure',
        },
      },
    },
  })
  @Get('/google')
  authenticateGoogleUser(@Res() res: Response) {
    const authUrl = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/google`;
    return res.redirect(authUrl);
  }

  @ApiExcludeEndpoint()
  @Get('/google/success')
  googleSuccessCallback(@Req() req: Request, @Res() res: Response) {
    const accessToken: string = req.cookies['accessToken'];

    if (!accessToken) {
      return res.status(401).json({ message: 'Access token missing' });
    }

    const feedUrl: string = `${this.configService.get<string>('CLIENT_URL')}/feed`;
    return res.redirect(feedUrl);
  }

  @ApiOperation({ summary: 'Registers users using google OAuth2' })
  @ApiResponse({
    status: 200,
    type: String,
  })
  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken: string = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token not provided' });
      }

      const logoutUrl = `${this.configService.get<{ string }>('AUTH_SERVICE_URL')}/api/auth/logout`;
      const options = {
        method: 'POST',
        data: { refreshToken },
        withCredentials: true,
      };

      const response = await this.httpService.forwardRequest<{
        message: string;
      }>(logoutUrl, options);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.json({
        message: response.data.message,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Logout failed' + error.message });
    }
  }

  @ApiExcludeEndpoint()
  @Get('/google/failure')
  googleFailureCallback(@Res() res: Response) {
    res.send('Something went wrong!');
  }
}
