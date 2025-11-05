import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { File as MulterFile } from 'multer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'stream';
import * as uuid from 'uuid';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from 'ffprobe-static';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

ffmpeg.setFfprobePath(ffprobeStatic.path);

@Injectable()
export class MinioService {
  private readonly s3Client: S3Client;

  private readonly bucketName: string | undefined;
  private readonly s3BaseUrl: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'http://localhost:9000',
      credentials: {
        accessKeyId:
          this.config.get<string>('MINIO_ROOT_USER') ?? 'innogram_user', //TODO переделать без вставки строк
        secretAccessKey:
          this.config.get<string>('MINIO_ROOT_PASSWORD') ?? 'innogram_admin',
      },

      forcePathStyle: true,
    });
    this.bucketName = this.config.get<string>('S3_BUCKET');
    this.s3BaseUrl = this.config.get<string>('S3_ENDPOINT');
  }

  private getVideoDuration(buffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const tempPath = `/tmp/${uuid.v4()}.mp4`;
      import('fs').then((fs) => {
        fs.writeFileSync(tempPath, buffer);
        ffmpeg.ffprobe(tempPath, (err, metadata) => {
          fs.unlinkSync(tempPath);
          if (err) return reject(err);
          resolve(metadata.format.duration || 0);
        });
      });
    });
  }

  async uploadFile(
    file: MulterFile,
  ): Promise<{ hashedFileName: string; type: string }> {
    let type: string;
    const fileExtension: string = extname(file.originalname).toLowerCase();
    const mimeType: string = file.mimetype;

    const isImage: boolean = mimeType.startsWith('image/');
    const isVideo: boolean = mimeType.startsWith('video/');

    if (!isImage && !isVideo)
      throw new BadRequestException('Unknown file type');

    if (isVideo) {
      const duration: number = await this.getVideoDuration(file.buffer);
      type = 'video';
      if (duration > 60) {
        throw new BadRequestException('Video is longer then one minute');
      }
    } else type = 'image';

    const hashedFileName: string = uuid.v4() + fileExtension;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: hashedFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return { hashedFileName, type };
  }

  async getPublicUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 600 });
  }

  async getFile(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Body as Readable;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        ('name' in error || '$metadata' in error)
      ) {
        const e = error as {
          name?: string;
          $metadata?: { httpStatusCode?: number };
        };

        if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) {
          throw new NotFoundException(`File "${key}" couldn't be found`);
        }
      }

      throw new InternalServerErrorException(
        `Error while getting file "${key}": ${error}`,
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  }
}
