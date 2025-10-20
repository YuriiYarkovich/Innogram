import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/global-filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { ContextMiddleware } from './common/middleware/context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('CORE_SERVICE_PORT') ?? 3001;
  const frontendUrl = configService.get<string>('CLIENT_URL');
  const isDev = configService.get<string>('NODE_ENV') === 'development';
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.jsdelivr.net',
            'https://unpkg.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", '*'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );
  app.useGlobalFilters(
    new HttpExceptionFilter(configService),
    //new AllExceptionsFilter(httpAdapterHost),
  );
  app.use(new ContextMiddleware().use);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: isDev ? [frontendUrl, 'http://localhost:3000'] : frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle(
      'API for Innogram -- better version of popular social network ;-)',
    )
    .setDescription(
      'Innogram is like an Instagram, but a bit better. Project created to practice real architectural solutions.\n' +
        'It allows users to share posts with photos and videos, follow others, like posts, leave comments, and communicate ' +
        'in private messages.\n' +
        'Technically, the application is implemented on NestJS and Express, using PostgreSQL, MinIO, Redis, and RabbitMQ.\n' +
        'The main goal is to explore how modern approaches (microservices, message queues, file storage, asynchronous ' +
        'interaction) work together and allow you to build a scalable and fault-tolerant application.',
    )
    .setVersion(`0.0.1`)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

bootstrap();
