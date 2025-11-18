import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';

let cachedHandler;

async function bootstrapServerless() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });

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

  // Configuración de CORS
  app.enableCors({
    origin: [
      'http://localhost:4200',                 // Local
      'https://frontendtp2.vercel.app',        // Producción
      /^https:\/\/frontendtp2.*\.vercel\.app$/ // <--- ESTA LÍNEA MÁGICA permite cualquier deploy preview del front
    ],
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

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