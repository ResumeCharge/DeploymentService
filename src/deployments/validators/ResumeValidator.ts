import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ResumesService } from '../../resumes/resumes.service';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
@ValidatorConstraint({ name: 'resumeValidator', async: false })
export class ResumeValidator implements ValidatorConstraintInterface {
  constructor(
    private resumeService: ResumesService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}
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
