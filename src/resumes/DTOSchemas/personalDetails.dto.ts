import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PersonalDetailsDTO {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsString()
  @IsOptional()
  location?: string;
  @IsString()
  @IsOptional()
  avatar?: string;
  @IsString()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsOptional()
  phone?: string;
  @IsString()
  @IsOptional()
  website?: string;
  @IsString()
  @IsOptional()
  linkedin?: string;
  @IsString()
  @IsOptional()
  github?: string;
  @IsOptional()
  @IsArray()
  languages?: Array<{ name: string; level: string }>;
}
