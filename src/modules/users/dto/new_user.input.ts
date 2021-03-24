import { Field, Int, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class NewUserInput {
  @Field()
  zaloId?: string;

  @Field()
  name?: string;

  @Field()
  nickname?: string;

  @Field({ defaultValue: '' })
  intro?: string;

  @Field()
  avatar?: number;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ defaultValue: true })
  isNew?: boolean;
}

@InputType()
export class UpdateUserInput extends PartialType(NewUserInput) {}
