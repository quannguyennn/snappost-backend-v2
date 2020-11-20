import { InputType, Field } from '@nestjs/graphql';
import { SNSTypeEnum } from 'src/graphql/enums/sns_type';
import { IsNotEmpty, ValidateIf } from 'class-validator';

@InputType()
export class LoginSNSInput {
  @ValidateIf((o) => o.snsType === SNSTypeEnum.PAYCO)
  @Field({ nullable: true })
  snsToken: string;

  @Field(() => SNSTypeEnum)
  @IsNotEmpty()
  snsType: SNSTypeEnum;
}
