import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ValidationPipe, Logger } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set API version prefix
  app.setGlobalPrefix('api/v1');

  // Security headers
  app.use(helmet());

  // Response compression
  app.use(compression());

  // Rate limiting (100 requests per 15 minutes per IP)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : true;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  // Swagger setup (enabled if ENABLE_SWAGGER=true or NODE_ENV !== production)
  const isSwaggerEnabled =
    process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';

  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('E-Commerce API')
      .setDescription('The E-Commerce API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Single startup flow
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  Logger.log(`Application successfully listening on port ${port}`);
}

void bootstrap().catch((err) => {
  Logger.error('Bootstrap failed', err);
});

