import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { S3Service } from './s3.service';

@Module({
  providers: [S3Service],
  imports: [HttpModule],
  exports: [S3Service],
})
export class S3Module {}
