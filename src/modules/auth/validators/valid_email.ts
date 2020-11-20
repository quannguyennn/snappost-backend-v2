import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import * as validator from 'validator';
import { UsersService } from 'src/modules/users/services/users.service';
import { User } from 'src/modules/users/entities/users.entity';
@ValidatorConstraint({ async: true, name: 'UniqueEmail' })
@Injectable()
export class UniqueEmail implements ValidatorConstraintInterface {
  constructor(private userService: UsersService) {}
  async validate(email: string): Promise<boolean> {
    const user: User | undefined = await this.userService.findByEmail(email);
    if (user) {
      return false;
    }
    return true;
  }
}

@ValidatorConstraint({ name: 'ValidEmail' })
@Injectable()
export class ValidEmail implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    try {
      if (validator.default.isEmail(value) === false || value.includes('+') === true) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      return false;
    }
  }
}
