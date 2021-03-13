import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class LoginSNSInput {
  @Field({ nullable: true })
  zaloCode: string;
}
