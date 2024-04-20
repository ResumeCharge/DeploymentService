import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { UsersService } from '../users/users.service';
import { AuthUser } from '../auth/decorators/authorization.decorator';
import {
  DEPLOYMENT_ERROR_SAVE_RESUME_USER_NOT_PREMIUM,
  DEPLOYMENT_ERROR_SAVE_RESUME_USER_TOO_MANY_RESUMES,
} from '../app.constants';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    private usersService: UsersService,
  ) {}
  async create(createResumeDto: CreateResumeDto, authUser: AuthUser) {
    const user = await this.usersService.getUser(authUser);
    const resumesForUser = await this.resumeModel
      .find({ userId: user.userId })
      .exec();
    if (resumesForUser.length > 5) {
      throw new BadRequestException(
        DEPLOYMENT_ERROR_SAVE_RESUME_USER_TOO_MANY_RESUMES,
      );
    }
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
