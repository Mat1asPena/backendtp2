import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: Aceptar todo para evitar dolores de cabeza
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Helmet: Desactivar bloqueo de recursos cruzados
  app.use(helmet({ crossOriginResourcePolicy: false }));

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

// Esta es la función que Vercel (a través de api/index.js) va a ejecutar
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

// Esta parte es para que funcione en tu PC (npm run start)
if (require.main === module) {
  async function startLocal() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });
    app.setGlobalPrefix('api');
    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  }
  startLocal();
}