import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.use(helmet());
  app.enableCors({
    origin: 'http://localhost:4200',
  });
  const port = process.env.PORT ? +process.env.PORT : 3000;
  await app.listen(port);
  console.log(`Server listening on port ${port}`);
}
bootstrap();
