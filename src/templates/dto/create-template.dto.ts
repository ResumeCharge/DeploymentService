import {
  IsBoolean,
  IsNotEmpty, IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
