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

ffmpeg.setFfprobePath(ffprobeStatic.path);

@Injectable()
export class MinioService {
  private s3Client: S3Client;

  private readonly bucketName = 'innogram-files';

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
  }

  private getVideoDuration(buffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const tempPath = `/tmp/${uuid.v4()}.mp4`;
      import('fs').then((fs) => {
        fs.writeFileSync(tempPath, buffer);
        ffmpeg.ffprobe(tempPath, (err, metadata) => {
          fs.unlinkSync(tempPath); // удаляем временный файл
          if (err) return reject(err);
          resolve(metadata.format.duration || 0);
        });
      });
    });
  }

  async uploadFile(file: MulterFile): Promise<{ url: string; type: string }> {
    let type: string;
    const fileExtension = extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (!isImage && !isVideo)
      throw new BadRequestException('Unknown file type');

    if (isVideo) {
      const duration = await this.getVideoDuration(file.buffer);
      type = 'video';
      if (duration > 60) {
        throw new BadRequestException('Video is longer then one minute');
      }
    } else type = 'image';

    const hashedFileName = uuid.v4() + fileExtension;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: hashedFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return { url: hashedFileName, type };
  }

  async getFile(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Body as Readable;
    } catch (error: any) {
      if (
        error.name === 'NoSuchKey' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        throw new NotFoundException(`File "${key}" couldn't be found`);
      }

      console.error(`Error while getting file "${key}":`, error);

      throw new InternalServerErrorException(
        'Error while getting file from MinIO',
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
