import { Field, InputType } from '@nestjs/graphql';
import { FollowStatus } from 'src/graphql/enums/follow/follow_status.enum';

@InputType()
export class FollowUserInput {
  @Field()
  followUser: number;

  @Field(() => FollowStatus)
  status: FollowStatus;
}

export class UnFollowUserInput {
  @Field()
  id: number;
}
