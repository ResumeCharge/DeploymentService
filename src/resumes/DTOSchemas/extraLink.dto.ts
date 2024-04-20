import { IsString } from 'class-validator';

export class ExtraLinkDTO {
  @IsString()
  linkName: string;
  @IsString()
  linkValue: string;
}
