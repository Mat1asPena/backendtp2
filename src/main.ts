import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';

let server: any;

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // CORS NUCLEAR: Acepta todo
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      credentials: true,
    });

    app.setGlobalPrefix('api');

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

  } catch (error) {
    // ESTO ES VITAL: Imprimir el error para verlo en los logs de Vercel
    console.error('❌ ERROR FATAL AL INICIAR EL SERVER:', error);
    throw error;
  }
}

export const handler = async (event: any, context: any, callback: any) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

export default handler;