import { Field, Int, InputType, PartialType } from '@nestjs/graphql';
import { AppRoles } from 'src/graphql/enums/roles.type';

@InputType()
export class NewUserInput {
  @Field()
  email?: string;

  @Field()
  name?: string;

  @Field()
  password?: string;

  @Field()
  phone?: string;

  @Field(() => Int)
  age?: number;

  @Field(() => AppRoles)
  roles?: AppRoles;

  isActive?: boolean;

  avatar?: string;
}

@InputType()
export class UpdateUserInput extends PartialType(NewUserInput) {}

@InputType()
export class AdminUpdateUserInput extends PartialType(NewUserInput) {
  @Field()
  id: string;

  @Field()
  deactiveReason?: string;

  @Field(() => [String])
  deleteLaundry?: string[];
}
