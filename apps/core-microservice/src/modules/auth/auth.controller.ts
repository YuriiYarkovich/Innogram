import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
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
import type { Response } from 'express';
import { AuthResponseDto } from './dto/auth-response.dto';
import { GoogleResponseDto } from './dto/google-response.dto';
import { HttpService } from './httpService';

@ApiTags('Authentication operations')
@ApiBearerAuth('access-token')
@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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
    try {
      const url: string = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/login`;
      const options = {
        method: 'POST',
        data: dto,
        withCredentials: true,
        headers: { 'x-device-id': req.headers['x-device-id'] },
      };

      const response = await this.httpService.forwardRequest<{
        accessToken: string;
        refreshToken: string;
      }>(url, options);

      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        res.setHeader('Set-Cookie', setCookie);
      }

      return res.json({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
    } catch (e) {
      console.error(e.response?.data);
      throw e;
    }
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

    const setCookie = response.headers?.['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.json({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
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
    console.log(`In google start point`);
    const authUrl = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/google`;
    return res.redirect(authUrl);
  }

  @ApiExcludeEndpoint()
  @Get('/google/success')
  googleSuccessCallback(
    @Res() res: Response,
    @Query('accessToken') accessToken: string,
  ) {
    try {
      console.log('In success endpoint');

      return res.json({
        accessToken,
      });
    } catch (e) {
      console.log(e.message);
      throw e;
    }
  }

  @ApiOperation({ summary: 'Registers users using google OAuth2' })
  @ApiResponse({
    status: 200,
    type: String,
  })
  @Post('/logout')
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    try {
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
      console.error('Logout error:', error.message);
      return res.status(500).json({ message: 'Logout failed' });
    }
  }

  @ApiExcludeEndpoint()
  @Get('/google/failure')
  googleFailureCallback(@Res() res: Response) {
    res.send('Something went wrong!');
  }
}
