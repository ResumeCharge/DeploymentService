import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DeploymentsModule } from './deployments/deployments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JsonBodyMiddleware } from './middleware/json-body.middleware';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { ResumesModule } from './resumes/resumes.module';
import { TemplatesModule } from './templates/templates.module';
import { AuthModule } from './auth/auth.module';
import { S3Service } from './s3-service/s3.service';

import { S3Module } from './s3-service/s3.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    DeploymentsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      envFilePath: [
        '.env',
        `.env.${ENV != null ? ENV.toLowerCase() : 'development'}`,
      ],
      isGlobal: true,
    }),
    ResumesModule,
    TemplatesModule,
    AuthModule,
    S3Module,
    UsersModule,
  ],
  providers: [S3Service],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/webhooks',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*');
  }
}
