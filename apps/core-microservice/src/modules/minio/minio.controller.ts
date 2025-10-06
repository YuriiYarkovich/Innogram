import { Controller, Get, Param, Res } from '@nestjs/common';
import { MinioService } from './minio.service';
import express from 'express';

@Controller('/api/files')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Get(':filename')
  async getFile(
    @Param('filename') filename: string,
    @Res() res: express.Response,
  ) {
    const fileStream = await this.minioService.getFile(filename);
    fileStream.pipe(res);
  }
}
