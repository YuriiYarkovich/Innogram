import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-account.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { ChatParticipant } from '../../common/entities/chatDedicated/chat-participant.entity';

@ApiTags('Authentication operations')
@ApiBearerAuth('access-token')
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({ summary: 'Authenticates users in system' })
  @ApiResponse({ status: 200, type: String })
  @Post('/login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const response = await axios.post(
        `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/login`,
        {
          ...dto,
        },
        { withCredentials: true },
      );

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

  @Post('/registration')
  async registerUser(@Body() dto: CreateAccountDto, @Res() res: Response) {
    try {
      const response = await axios.post(
        `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/registration`,
        {
          ...dto,
        },
        { withCredentials: true },
      );

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

  @Get('/google')
  authenticateGoogleUser(@Res() res: Response) {
    console.log(`In google start point`);
    const authUrl = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/google`;
    return res.redirect(authUrl);
  }

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

  @Post('/logout')
  async logout(@Body('token') token: string, @Res() res: Response) {
    try {
      const authUrl = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/logout`;

      if (!token) {
        return res.status(400).json({ message: 'Token not provided' });
      }

      const { data } = await axios.post(
        authUrl,
        { token },
        { withCredentials: true },
      );

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.json({ message: 'Logged out successfully', result: data });
    } catch (error) {
      console.error('Logout error:', error.message);
      return res.status(500).json({ message: 'Logout failed' });
    }
  }

  @Get('/google/failure')
  googleFailureCallback(@Res() res: Response) {
    res.send('Something went wrong!');
  }
}
