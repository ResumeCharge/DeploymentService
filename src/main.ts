import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PORT } from './app.constants';
import { useContainer } from 'class-validator';
import { HttpErrorFilter } from './middleware/HttpErrorFilter';
import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get<ConfigService>(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalFilters(new HttpErrorFilter());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  await app.listen(configService.get(PORT));
}
bootstrap();
