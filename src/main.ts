import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';
// NO importes aws-lambda aquí para evitar errores de compilación

let server: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS NUCLEAR: Acepta todo
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Helmet permisivo
  app.use(helmet({ 
    crossOriginResourcePolicy: false, 
  }));

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

// Handler genérico
export const handler = async (event: any, context: any, callback: any) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};