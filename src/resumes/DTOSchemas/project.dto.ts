import { IsString } from 'class-validator';

export class ProjectDTO {
  @IsString()
  title: string;
  @IsString()
  details: string;
}
