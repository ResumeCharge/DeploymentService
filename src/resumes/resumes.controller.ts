import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resource } from '../auth/decorators/resource.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResourceId } from '../auth/decorators/resourceId.decorator';
import { ResumeGuardService } from '../resource-guards/resume-guard/resume-guard.service';
import {
  Authorization,
  AuthUser,
} from '../auth/decorators/authorization.decorator';

@Resource('Resumes')
@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly logger: Logger,
  ) {}

  @UseGuards(JwtAuthGuard, ResumeGuardService)
  @Post()
  create(
    @Authorization() authUser: AuthUser,
    @Body() createResumeDto: CreateResumeDto,
  ) {
    this.logger.log(
      `Received create resume request for user: ${authUser.userId}`,
    );
    return this.resumesService.create(createResumeDto, authUser);
  }

  @UseGuards(JwtAuthGuard, ResumeGuardService)
  @Get(':id')
  @ResourceId('id')
  async findOne(@Param('id') id: string) {
    const resume = await this.resumesService.findOneResume(id);
    if (!resume) {
      throw new NotFoundException('No resume with id ' + id + ' found');
    }
    return resume;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:userId')
  async findAllResumesForUser(@Param('userId') userId: string) {
    const resumes = await this.resumesService.findAllResumesForUser(userId);
    if (!resumes) {
      throw new NotFoundException('No resumes found for user id ' + userId);
    }
    return resumes;
  }

  @UseGuards(JwtAuthGuard, ResumeGuardService)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto) {
    return this.resumesService.update(id, updateResumeDto);
  }

  @UseGuards(JwtAuthGuard, ResumeGuardService)
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
