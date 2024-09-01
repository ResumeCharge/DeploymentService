import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    UsersModule,
  ],
  providers: [],
})
export class AuthModule {}
