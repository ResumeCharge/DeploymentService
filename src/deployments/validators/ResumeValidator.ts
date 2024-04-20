import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ResumesService } from '../../resumes/resumes.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'resumeValidator', async: false })
export class ResumeValidator implements ValidatorConstraintInterface {
  private readonly logger: Logger;
  constructor(private resumeService: ResumesService) {
    this.logger = new Logger();
  }
  defaultMessage(): string {
    return 'Resume ID not found!';
  }
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    return this.resumeService
      .findOneResume(value)
      .then((resume) => {
        return resume && resume.userId === validationArguments.object['userId'];
      })
      .catch((err) => {
        this.logger.log(`error in ResumeValidator`, JSON.stringify(err));
        return false;
      });
  }
}
