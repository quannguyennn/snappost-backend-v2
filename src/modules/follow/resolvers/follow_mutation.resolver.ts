import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/common.decorator';
import { FollowStatus } from 'src/graphql/enums/follow/follow_status.enum';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { User } from 'src/modules/users/entities/users.entity';
import { Follow } from '../entities/follow.entity';
import { FollowService } from '../services/follow.service';

@Resolver(() => Follow)
export class FollowMutationResolver {
  constructor(private readonly followService: FollowService) { }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => Boolean)
  async FollowUser(@CurrentUser() user: User, @Args('id') id: number) {
    return await this.followService.followUser(user.id, { followUser: id, status: FollowStatus.WAITING });
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => Boolean)
  async UnFollowUser(@CurrentUser() user: User, @Args('id') id: number) {
    return await this.followService.unFollowUser(user.id, id);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => Boolean)
  async handleFollowRequest(@Args("userId") userId: number, @CurrentUser() me: User, @Args("accept") accept: boolean) {
    return await this.followService.handleFollowRequest(userId, me.id, accept)
  }
}
