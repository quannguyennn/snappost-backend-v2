import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength, Validate, ValidateIf } from 'class-validator';
import { ValidEmail, UniqueEmail } from 'src/modules/auth/validators/valid_email';
import { errorName } from 'src/errors';
import { UniquePhone } from '../validators/valid_phone';
import { AppRoles } from 'src/graphql/enums/roles.type';
import { SNSTypeEnum } from 'src/graphql/enums/sns_type';

@InputType()
export class UserRegister {
  @Field()
  nickname?: string;

  @Field()
  @Validate(ValidEmail, {
    message: errorName.INVALID_EMAIL,
  })
  @Validate(UniqueEmail, {
    message: errorName.EMAIL_EXIST,
  })
  email: string;

  @Field({ nullable: true })
  snsToken?: string;

  @Field(() => SNSTypeEnum, { nullable: true })
  snsType: SNSTypeEnum;

  @Field({ nullable: true })
  googleId?: string;
}
