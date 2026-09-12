import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const frontendUrl = configService.get<string>('app.frontendUrl', 'http://localhost:3000');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // Security middleware
  app.use(helmet({ contentSecurityPolicy: nodeEnv === 'production' }));

  // CORS
  const allowedOrigins = Array.from(
    new Set([frontendUrl, ...(nodeEnv !== 'production' ? ['http://localhost:3000'] : [])]),
  );
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.up.railway.app') || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-signature', 'x-event-id'],
  });

  // Cookie parser
  app.use(cookieParser(configService.get<string>('cookie.secret')));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger documentation
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CashDash API')
      .setDescription('CashDash rewards platform REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('wallet', 'Wallet & transactions')
      .addTag('offers', 'Offer listings')
      .addTag('withdrawals', 'Withdrawal management')
      .addTag('notifications', 'Notification management')
      .addTag('leaderboard', 'Leaderboard rankings')
      .addTag('referrals', 'Referral program')
      .addTag('support', 'Support tickets')
      .addTag('admin', 'Admin operations')
      .addTag('webhooks', 'Provider webhooks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`🚀 CashDash API running on http://localhost:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
  }
}

bootstrap();
