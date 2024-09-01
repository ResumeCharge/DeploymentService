import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PORT } from './app.constants';
import { useContainer } from 'class-validator';
import { HttpErrorFilter } from './middleware/HttpErrorFilter';
import * as bodyParser from 'body-parser';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import 'winston-daily-rotate-file';
import * as winston from 'winston';

const winstonConsoleOptions = {
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('UserService', {
      colors: true,
      prettyPrint: true,
      processId: true,
      appName: true,
    }),
  ),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: false,
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.DailyRotateFile({
          level: 'info',
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('UserService', {
              colors: false,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
        new winston.transports.Console(winstonConsoleOptions),
      ],
    }),
  });
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

  await app.listen(configService.get(PORT));
}

bootstrap();
