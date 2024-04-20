import { IsString } from 'class-validator';

export class EducationDTO {
  @IsString()
  degree: string;
  @IsString()
  university: string;
  @IsString()
  startDate: string;
  @IsString()
  endDate: string;
  @IsString()
  details: string;
}
