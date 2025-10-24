import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from './httpService';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async validateAccessToken(
    accessToken: string,
  ): Promise<{ profileId: string; role: string }> {
    console.log(`Sending access token on validation`);
    const url: string = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/validate`;
    const options = {
      method: 'POST',
      data: { accessToken },
    };
    const response = await this.httpService.forwardRequest<{
      valid: boolean;
      user: { profileId: string; role: string };
    }>(url, options);

    console.log(
      `Access token returned everything is fine. User: ${JSON.stringify(response.data.user)}`,
    );
    return response.data.user;
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ newAccessToken: string; user: unknown }> {
    const url: string = `${this.configService.get<string>('AUTH_SERVICE_URL')}/api/auth/refresh`;
    const options = {
      method: 'POST',
      data: { refreshToken },
      withCredentials: true,
    };
    const refreshData = await this.httpService.forwardRequest<{
      user: { profileId: string; role: string };
      newAccessToken: string;
    }>(url, options);
    return {
      newAccessToken: refreshData.data.newAccessToken,
      user: refreshData.data.user,
    };
  }
}
