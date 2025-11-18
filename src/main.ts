import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';

let cachedHandler: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS para TODOS (Local y Prod)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  
  // Helmet permisivo para evitar bloqueos raros
  app.use(helmet({ crossOriginResourcePolicy: false }));

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(process.env.PORT || 3000);
}

// Lógica de arranque condicional
if (process.env.VERCEL) {
  // EN VERCEL: Exportamos el handler para serverless
  console.log('Arrancando en modo Serverless (Vercel)...');
} else {
  // EN LOCAL: Arrancamos el servidor normal
  bootstrap();
}

// Handler para Vercel
export const handler = async (event: any, context: any) => {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      credentials: true,
    });
    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({ app: expressApp });
  }
  return cachedHandler(event, context);
};