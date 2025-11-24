import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { json, urlencoded } from 'express';

const server = express();
const PORT = process.env.PORT || 3000;

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

  // En desarrollo local, escuchar en el puerto
  if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
      console.log(`Backend escuchando en http://localhost:${PORT}`);
    });
  }
}

// arrancar bootstrap
bootstrap().catch((err) => console.error('Bootstrap error:', err));

export default server;