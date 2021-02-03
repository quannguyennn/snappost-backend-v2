import { Field, Int, InputType, PartialType } from '@nestjs/graphql';
import { AppRoles } from 'src/graphql/enums/roles.type';

@InputType()
export class NewUserInput {
  @Field()
  email?: string;

  @Field()
  nickname?: string;

  @Field()
  password?: string;

  @Field()
  phone?: string;

  @Field()
  avatar?: string;
}

@InputType()
export class UpdateUserInput extends PartialType(NewUserInput) {}
