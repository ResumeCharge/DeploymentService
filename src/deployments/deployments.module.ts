import { Logger, Module } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { DeploymentsController } from './deployments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Deployment, DeploymentSchema } from './schemas/deployment.schema';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';
import {
  WebsiteTemplate,
  WebsiteTemplateSchema,
} from '../templates/schemas/websiteTemplate.schema';
import { ResumeValidator } from './validators/ResumeValidator';
import { TemplateValidator } from './validators/TemplateValidator';
import {
  PendingDeployment,
  PendingDeploymentSchema,
} from './schemas/pendingDeployment.schema';
import { ResumesModule } from '../resumes/resumes.module';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from '../users/users.module';
import { StaticAssetsModule } from '../static-assets/static-assets.module';

@Module({
  controllers: [DeploymentsController],
  providers: [DeploymentsService, ResumeValidator, TemplateValidator, Logger],
  imports: [
    ConfigModule,
    HttpModule,
    UsersModule,
    ResumesModule,
    TemplatesModule,
    StaticAssetsModule,
    MongooseModule.forFeature([
      { name: Deployment.name, schema: DeploymentSchema },
    ]),
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    MongooseModule.forFeature([
      { name: WebsiteTemplate.name, schema: WebsiteTemplateSchema },
    ]),
    MongooseModule.forFeature([
      { name: PendingDeployment.name, schema: PendingDeploymentSchema },
    ]),
  ],
})
export class DeploymentsModule {}
