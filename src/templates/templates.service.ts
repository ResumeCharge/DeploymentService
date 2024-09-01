import { Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WebsiteTemplate,
  WebsiteTemplateDocument,
} from './schemas/websiteTemplate.schema';
import { templatesSeedData } from './seed/templates-seed-data';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(WebsiteTemplate.name)
    private websiteTemplateModel: Model<WebsiteTemplateDocument>,
  ) {}

  async create(createTemplateDto: CreateTemplateDto) {
    return await this.websiteTemplateModel.create(createTemplateDto);
  }

  async doesTemplateExist(id: string) {
    const result = await this.websiteTemplateModel.count({ _id: id }).exec();
    return result !== 0;
  }

  findAll() {
    return this.websiteTemplateModel.find().exec();
  }

  async findOne(id: string) {
    return this.websiteTemplateModel.findOne({ _id: id }).exec();
  }

  remove(id: string) {
    return `This action removes a #${id} template`;
  }

  // Create the standalone user if they don't exist
  async onModuleInit(): Promise<void> {
    await this.seedTemplates();
  }

  async seedTemplates() {
    const dbTemplates = await this.websiteTemplateModel.find();
    const missingTemplates = templatesSeedData.filter((template) => {
      return !dbTemplates.some((dbTemplate) => dbTemplate._id === template._id);
    });
    for (const missingTemplate of missingTemplates) {
      await this.websiteTemplateModel.create(missingTemplate);
    }
  }
}
