import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { json, urlencoded } from 'express';

const server = express();

async function bootstrap() {
  // Crear Nest sobre Express para que Vercel exponga correctamente la app
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const apiPrefix = process.env.API_PREFIX ?? 'api';
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));

  await app.init();
}

// arrancar bootstrap (no listen) y exportar el server express
bootstrap().catch((err) => console.error('Bootstrap error:', err));

export default server;