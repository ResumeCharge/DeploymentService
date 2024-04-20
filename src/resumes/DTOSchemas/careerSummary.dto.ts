import { IsString } from 'class-validator';

export class CareerSummaryDTO {
  @IsString()
  summary: string;
}
