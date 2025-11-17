import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import helmet from 'helmet';

let server: any;

async function bootstrapServer() {
  if (!server) {
    const expressInstance = express();
    const adapter = new ExpressAdapter(expressInstance);

    const app = await NestFactory.create(AppModule, adapter);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(helmet());
    app.enableCors({
      origin: ['http://localhost:4200', 'https://frontendtp2.vercel.app'],
    });

    await app.init();

    server = serverlessExpress({ app: expressInstance });
  }
  return server;
}

export default async function handler(event, context) {
  const s = await bootstrapServer();
  return s(event, context);
}
