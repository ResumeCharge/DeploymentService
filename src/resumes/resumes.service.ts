import { Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {}

  async create(createResumeDto: CreateResumeDto) {
    return await this.resumeModel.create(createResumeDto);
  }

  async doesResumeExist(id: string) {
    const result = await this.resumeModel.count({ _id: id }).exec();
    return result !== 0;
  }

  findAllResumesForUser(userId: string) {
    return this.resumeModel.find({ userId: userId }).exec();
  }

  findOneResume(_id: string) {
    return this.resumeModel.findOne({ _id: _id }).exec();
  }

  async update(id: string, updateResumeDto: UpdateResumeDto) {
    const resume = await this.resumeModel.findOne({ _id: id });
    const updated = Object.assign(resume, updateResumeDto);
    return await updated.save();
  }

  remove(_id: string) {
    return this.resumeModel.findOneAndDelete({ _id: _id }).exec();
  }
}
