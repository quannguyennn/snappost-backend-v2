import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength } from 'class-validator';
import { errorName } from 'src/errors';
@InputType()
export class ChangePasswordTokenInput {
  @MinLength(8, {
    message: errorName.TOO_SHORT,
  })
  @MaxLength(15, {
    message: errorName.TOO_LONG,
  })
  // @Validate(ValidPassword, {
  //   message: errorName.INVALID_PASSWORD,
  // })
  @Field()
  password: string;

  @Field()
  token: string;
}

@InputType()
export class ChangePasswordInput {
  @MinLength(8, {
    message: errorName.TOO_SHORT,
  })
  @MaxLength(15, {
    message: errorName.TOO_LONG,
  })
  @Field()
  old_password: string;

  @MinLength(8, {
    message: errorName.TOO_SHORT,
  })
  @MaxLength(15, {
    message: errorName.TOO_LONG,
  })
  @Field()
  new_password: string;
}
