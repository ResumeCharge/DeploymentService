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
import { ResourceGuardsService } from './resource-guards/resource-guards.service';
import { ResourceGuardsModule } from './resource-guards/resource-guards.module';
import { ResumeGuardService } from './resource-guards/resume-guard/resume-guard.service';
import { S3Service } from './s3-service/s3.service';

import { S3Module } from './s3-service/s3.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

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
    ConfigModule.forRoot({ envFilePath: '.development.env' }),
    ResumesModule,
    TemplatesModule,
    AuthModule,
    ResourceGuardsModule,
    S3Module,
    UsersModule,
  ],
  providers: [ResourceGuardsService, ResumeGuardService, S3Service],
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
