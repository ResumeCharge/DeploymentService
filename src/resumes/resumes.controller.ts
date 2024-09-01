import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resource } from '../auth/decorators/resource.decorator';
import { ResourceId } from '../auth/decorators/resourceId.decorator';

@Resource('Resumes')
@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly logger: Logger,
  ) {}

  @Post()
  create(@Body() createResumeDto: CreateResumeDto) {
    return this.resumesService.create(createResumeDto);
  }

  @Get(':id')
  @ResourceId('id')
  async findOne(@Param('id') id: string) {
    const resume = await this.resumesService.findOneResume(id);
    if (!resume) {
      throw new NotFoundException('No resume with id ' + id + ' found');
    }
    return resume;
  }

  @Get('/user/:userId')
  async findAllResumesForUser(@Param('userId') userId: string) {
    const resumes = await this.resumesService.findAllResumesForUser(userId);
    if (!resumes) {
      throw new NotFoundException('No resumes found for user id ' + userId);
    }
    return resumes;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto) {
    return this.resumesService.update(id, updateResumeDto);
  }

  @Delete(':id')
  @ResourceId('id')
  async remove(@Param('id') id: string) {
    const resume = await this.resumesService.remove(id);
    if (!resume) {
      throw new NotFoundException('No resume with id ' + id + ' found');
    }
    return resume;
  }
}
