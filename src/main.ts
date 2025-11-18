import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';

let cachedHandler;

async function bootstrapServerless() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  // 1. CORS: Esto es lo CRÍTICO. 
  // "origin: true" le dice al backend: "Acepta peticiones de quien sea".
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // 2. Prefijo Global
  app.setGlobalPrefix('api');

  // 3. Seguridad (Ajustada para no bloquear APIs cruzadas)
  app.use(helmet({
    crossOriginResourcePolicy: false, 
  }));

  // 4. Validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler = async (event, context) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServerless();
  }
  return cachedHandler(event, context);
};