import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FollowUserInput {
  @Field()
  followUser: number;

  @Field(() => String)
  status: string;
}

export class UnFollowUserInput {
  @Field()
  id: number;
}
