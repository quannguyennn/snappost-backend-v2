import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { User } from 'src/modules/users/entities/users.entity';
@ValidatorConstraint({ async: true, name: 'UniquePhone' })
@Injectable()
export class UniquePhone implements ValidatorConstraintInterface {
  constructor(private userService: UsersService) {}
  async validate(email: string): Promise<boolean> {
    const user: User | undefined = await this.userService.findByPhone(email);
    if (user) {
      return false;
    }
    return true;
  }
}
