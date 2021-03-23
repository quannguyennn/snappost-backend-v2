import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/common.decorator';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { User } from 'src/modules/users/entities/users.entity';
import { UsersService } from 'src/modules/users/services/users.service';

import { Follow, FollowConnection } from '../entities/follow.entity';
import { FollowService } from '../services/follow.service';

@Resolver(() => Follow)
export class FollowQueryResolver {
  constructor(private readonly followService: FollowService, private readonly userService: UsersService) {}

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => FollowConnection)
  async getFollowRequest(@CurrentUser() user: User, @Args('limit') limit: number, @Args('page') page: number) {
    return await this.followService.getFollowRequest(user.id, limit, page);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => Number)
  async countFollowRequest(@CurrentUser() user: User) {
    return await this.followService.countFollowRequest(user.id);
  }

  @ResolveField(() => User)
  async requestInfo(@Parent() follow: Follow) {
    return await this.userService.findById(follow.creatorId);
  }
}
