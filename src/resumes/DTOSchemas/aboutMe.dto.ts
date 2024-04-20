import { IsOptional, IsString } from 'class-validator';

export class AboutMeDTO {
  @IsOptional()
  @IsString()
  aboutMe: string;
}
