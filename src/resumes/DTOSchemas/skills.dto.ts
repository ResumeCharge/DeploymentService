import { IsOptional, IsString } from 'class-validator';

export class SkillsDTO {
  @IsOptional()
  @IsString()
  skills: string;
}
