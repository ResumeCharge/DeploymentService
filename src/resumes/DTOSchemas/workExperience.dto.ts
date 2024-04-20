import { IsString } from 'class-validator';

export class WorkExperienceDTO {
  @IsString()
  roleName: string;
  @IsString()
  company: string;
  @IsString()
  location: string;
  @IsString()
  startDate: string;
  @IsString()
  endDate: string;
  @IsString()
  details: string;
}
