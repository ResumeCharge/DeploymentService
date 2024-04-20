import { Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WebsiteTemplate,
  WebsiteTemplateDocument,
} from './schemas/websiteTemplate.schema';

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
}
