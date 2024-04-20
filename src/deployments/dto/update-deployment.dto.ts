import { PartialType } from '@nestjs/mapped-types';
import { CreateDeploymentDto } from './create-deployment.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeploymentDto extends PartialType(CreateDeploymentDto) {
  @IsString()
  @IsOptional()
  status?: string;
  @IsNumber()
  @IsOptional()
  progress?: number;
  @IsBoolean()
  @IsOptional()
  cancellationRequested?: boolean;
}
