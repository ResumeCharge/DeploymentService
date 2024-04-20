import { Logger, Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, Logger],
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    UsersModule,
  ],
  exports: [ResumesService],
})
export class ResumesModule {}
