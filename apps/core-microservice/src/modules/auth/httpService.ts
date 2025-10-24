import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpException } from '@nestjs/common';

export class HttpService {
  async forwardRequest<T = any>(
    url: string,
    options: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await axios(url, options);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        throw new HttpException(e.response.data, e.response.status);
      }
      throw new HttpException('Internal server error', 500);
    }
  }
}
