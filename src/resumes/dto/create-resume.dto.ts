import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PersonalDetailsDTO } from '../DTOSchemas/personalDetails.dto';
import { ExtraLinkDTO } from '../DTOSchemas/extraLink.dto';
import { CareerSummaryDTO } from '../DTOSchemas/careerSummary.dto';
import { EducationDTO } from '../DTOSchemas/education.dto';
import { WorkExperienceDTO } from '../DTOSchemas/workExperience.dto';
import { ProjectDTO } from '../DTOSchemas/project.dto';
import { AboutMeDTO } from '../DTOSchemas/aboutMe.dto';
import { SkillsDTO } from '../DTOSchemas/skills.dto';

export class CreateResumeDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
  @IsString()
  @IsNotEmpty()
  nickname: string;
  @ValidateNested()
  @Type(() => PersonalDetailsDTO)
  personalDetails: PersonalDetailsDTO;
  @IsOptional()
  @ValidateNested()
  @Type(() => ExtraLinkDTO)
  extraLinkList?: Array<ExtraLinkDTO>;
  @ValidateNested()
  @Type(() => CareerSummaryDTO)
  careerSummary: CareerSummaryDTO;
  @IsOptional()
  @ValidateNested()
  @Type(() => EducationDTO)
  educationList?: Array<EducationDTO>;
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkExperienceDTO)
  workExperienceList?: Array<WorkExperienceDTO>;
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectDTO)
  projectsList?: Array<ProjectDTO>;
  @IsOptional()
  @IsArray()
  awardsAndAccoladesList?: Array<string>;
  @IsOptional()
  @ValidateNested()
  @Type(() => SkillsDTO)
  skills?: SkillsDTO;
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutMeDTO)
  aboutMe?: AboutMeDTO;
  @IsOptional()
  extraWebsiteDetails?: Map<string, string>;
}
