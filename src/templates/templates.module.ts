import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebsiteTemplate,
  WebsiteTemplateSchema,
} from './schemas/websiteTemplate.schema';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService],
  imports: [
    MongooseModule.forFeature([
      { name: WebsiteTemplate.name, schema: WebsiteTemplateSchema },
    ]),
  ],
  exports: [TemplatesService],
})
export class TemplatesModule {}
