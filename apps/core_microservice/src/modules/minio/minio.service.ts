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
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'stream';
import * as uuid from 'uuid';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from 'ffprobe-static';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Worker, WorkerOptions } from 'worker_threads';
import path from 'node:path';

ffmpeg.setFfprobePath(ffprobeStatic.path);

interface VideoWorkerMessage {
  duration?: number;
  error?: string;
}

@Injectable()
export class MinioService {
  private readonly s3Client: S3Client;
  private readonly s3PublicClient: S3Client;

  private readonly bucketName: string | undefined;
  private readonly s3BaseUrl: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: this.config.get<string>('MINIO_REGION'),
      endpoint: this.config.get<string>('S3_ENDPOINT'),
      credentials: {
        accessKeyId:
          this.config.get<string>('MINIO_ROOT_USER') ?? 'innogram_user', //TODO переделать без вставки строк
        secretAccessKey:
          this.config.get<string>('MINIO_ROOT_PASSWORD') ?? 'innogram_admin',
      },

      forcePathStyle: true,
    });

    // Separate client for public signed URLs
    this.s3PublicClient = new S3Client({
      region: this.config.get<string>('MINIO_REGION'),
      endpoint: this.config.get<string>('S3_URL'),
      credentials: {
        accessKeyId:
          this.config.get<string>('MINIO_ROOT_USER') ?? 'innogram_user',
        secretAccessKey:
          this.config.get<string>('MINIO_ROOT_PASSWORD') ?? 'innogram_admin',
      },
      forcePathStyle: true,
    });

    this.bucketName = this.config.get<string>('S3_BUCKET');
    this.s3BaseUrl = this.config.get<string>('S3_URL');
  }

  getVideoDuration(buffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const isCompiled = __filename.endsWith('.js');
      const workerOptions: WorkerOptions = {
        workerData: { buffer },
        ...(isCompiled ? {} : { execArgv: ['-r', 'ts-node/register'] }),
      };
      const worker = new Worker(
        path.resolve(
          __dirname,
          isCompiled ? 'video_duration.worker.js' : 'video_duration.worker.ts',
        ),
        workerOptions,
      );

      worker.on('message', (msg: VideoWorkerMessage) => {
        if (msg.error) return reject(new Error(msg.error));
        resolve(msg.duration ?? 0);
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  generateHashedFileName(originalName: string): string {
    const fileExtension: string = extname(originalName).toLowerCase();
    return uuid.v4() + fileExtension;
  }

  async uploadFile(
    file: MulterFile,
    newHashedFilename?: string,
  ): Promise<{ hashedFileName: string; type: string }> {
    Logger.log(1);
    let type: string;
    const mimeType: string = file.mimetype;

    const isImage: boolean = mimeType.startsWith('image/');
    const isVideo: boolean = mimeType.startsWith('video/');
    Logger.log(2);
    if (!isImage && !isVideo)
      throw new BadRequestException('Unknown file type');
    Logger.log(3);
    if (isVideo) {
      Logger.log('Video');
      const duration: number = await this.getVideoDuration(file.buffer);
      type = 'video';
      if (duration > 60) {
        throw new BadRequestException('Video is longer then one minute');
      }
    } else type = 'image';
    Logger.log(4);
    const hashedFileName: string = newHashedFilename
      ? newHashedFilename
      : this.generateHashedFileName(file.originalname);
    Logger.log(5);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: hashedFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    Logger.log(6);

    await this.s3Client.send(command);
    Logger.log(7);
    return { hashedFileName, type };
  }

  async getPublicUrl(fileKey?: string): Promise<string | undefined> {
    if (!fileKey) return undefined;
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    const url: string | null = await getSignedUrl(
      this.s3PublicClient,
      command,
      {
        expiresIn: 600,
      },
    );

    if (!url) return undefined;

    Logger.log(`Public url: ${url}`);
    return url;
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
