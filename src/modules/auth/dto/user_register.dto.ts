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
  @MinLength(2, {
    message: errorName.TOO_SHORT,
  })
  @MaxLength(15, {
    message: errorName.TOO_LONG,
  })
  name: string;
  @Field()
  @Validate(ValidEmail, {
    message: errorName.INVALID_EMAIL,
  })
  @Validate(UniqueEmail, {
    message: errorName.EMAIL_EXIST,
  })
  email: string;

  @Field()
  @Validate(UniquePhone, {
    message: errorName.PHONE_EXIST,
  })
  phone: string;

  @ValidateIf((o) => !o.snsToken)
  @MinLength(8, {
    message: errorName.TOO_SHORT,
  })
  @MaxLength(15, {
    message: errorName.TOO_LONG,
  })
  // @Validate(ValidPassword, {
  //   message: errorName.INVALID_PASSWORD,
  // })
  @Field({ nullable: true })
  password?: string;

  @Field(() => AppRoles)
  roles: AppRoles;

  @Field({ nullable: true })
  laundryCode?: string;

  @Field({ nullable: true })
  snsToken?: string;

  @Field(() => SNSTypeEnum, { nullable: true })
  snsType: SNSTypeEnum;
  @Field({ nullable: true })
  paycoId?: string;
  @Field({ nullable: true })
  googleId?: string;
  @Field({ nullable: true })
  kakaoId?: string;
  @Field({ nullable: true })
  naverId?: string;
}
