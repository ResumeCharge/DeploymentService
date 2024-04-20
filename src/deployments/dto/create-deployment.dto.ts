import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { ResumeValidator } from '../validators/ResumeValidator';
import { TemplateValidator } from '../validators/TemplateValidator';
import { IWebsiteDetails } from '../interfaces/deployments.interfaces';

export class CreateDeploymentDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
  @IsOptional()
  websiteDetails: IWebsiteDetails;
  @IsNotEmpty()
  @IsString()
  @Validate(ResumeValidator)
  resumeId: string;
  @IsNotEmpty()
  @IsString()
  @Validate(TemplateValidator)
  templateId: string;
  @IsOptional()
  seoTag: string;
  @IsNotEmpty()
  @IsString()
  deploymentProvider: string;
}
