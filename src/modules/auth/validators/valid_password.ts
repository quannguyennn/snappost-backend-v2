import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'ValidPassword' })
@Injectable()
export class ValidPassword implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (password !== '') {
      const pattern = /^((?=.*\d)(?=.*\W).{8,15})$/;
      const regexPassword = pattern.test(password);
      if (!regexPassword) return false;
      return true;
    }
    return true;
  }
}
