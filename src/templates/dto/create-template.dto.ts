import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  _id: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsString()
  @IsOptional()
  mainImage: string;
}
