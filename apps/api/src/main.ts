import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { AppModule } from './app.module';

const server: Express = express();
let isInitialized = false;

export async function bootstrapServer(): Promise<Express> {
  if (isInitialized) {
    return server;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'production');

  app.use(helmet({ contentSecurityPolicy: false }));

  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-signature', 'x-event-id'],
  });

  app.use(cookieParser(configService.get<string>('cookie.secret', 'default-cookie-secret')));
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CashDash API')
      .setDescription('CashDash rewards platform REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.init();
  isInitialized = true;
  return server;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrapServer();
  return app(req, res);
}

if (!process.env.VERCEL) {
  bootstrapServer().then(() => {
    const port = parseInt(process.env.PORT ?? process.env.API_PORT ?? '3001', 10);
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 CashDash API running on http://0.0.0.0:${port}/api/v1`);
    });
  }).catch((err) => {
    console.error('Failed to bootstrap server:', err);
  });
}
