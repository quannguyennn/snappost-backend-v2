import { InputType, Field } from '@nestjs/graphql';
import { SNSTypeEnum } from 'src/graphql/enums/sns_type';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class LoginSNSInput {
  @Field({ nullable: true })
  snsToken: string;

  @Field(() => SNSTypeEnum)
  @IsNotEmpty()
  snsType: SNSTypeEnum;
}
