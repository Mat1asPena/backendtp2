import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
// import serverlessExpress from '@vendia/serverless-express'; // No usado por ahora

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.enableCors({
    origin: [
      'http://localhost:4200',            
      'https://frontendtp2.vercel.app'    
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // Prefijo global para las rutas de la API
  app.setGlobalPrefix('api');

  // Seguridad y Validación
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Iniciar la aplicación
  await app.listen(process.env.PORT || 3000);
}
bootstrap();