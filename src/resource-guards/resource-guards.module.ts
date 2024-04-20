import { Module } from '@nestjs/common';
import { ResumesService } from '../resumes/resumes.service';
import { ResourceGuardsService } from './resource-guards.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';
import { ResumeGuardService } from './resume-guard/resume-guard.service';
import { OrderGuardService } from './order-guard/order-guard.service';
import { GeneratorServiceGuard } from './generator-service-guard/generator-service-guard';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [
    ResourceGuardsService,
    ResumeGuardService,
    OrderGuardService,
    GeneratorServiceGuard,
  ],
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    UsersModule,
  ],
})
export class ResourceGuardsModule {}
