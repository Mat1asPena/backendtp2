import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';

let cachedHandler;

async function bootstrapServerless() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://frontendtp2.vercel.app'
    ],
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Prefijo para todas las rutas
  app.setGlobalPrefix('api');

  // Seguridad
  app.use(helmet());

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Inicializar Nest
  await app.init();

  // Adaptar Express a serverless
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

// Handler que Vercel usa como lambda
export const handler = async (event, context) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServerless();
  }
  return cachedHandler(event, context);
};