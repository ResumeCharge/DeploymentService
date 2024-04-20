import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { TemplatesService } from '../../templates/templates.service';

@Injectable()
@ValidatorConstraint({ name: 'templateValidator', async: true })
export class TemplateValidator implements ValidatorConstraintInterface {
  constructor(private templatesService: TemplatesService) {}
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'WebsiteTemplate ID not found!';
  }
  validate(value: string): Promise<boolean> | boolean {
    return this.templatesService
      .doesTemplateExist(value)
      .then((templatesFound) => {
        return templatesFound;
      })
      .catch((err) => {
        return false;
      });
  }
}
