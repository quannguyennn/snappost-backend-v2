import { Field, InputType } from '@nestjs/graphql';
import { FollowStatus } from '../entities/follow.entity';

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
