import { Resolver, Args, Query } from '@nestjs/graphql';
import { UsersService } from '../services/users.service';
import { User, UserConnection } from '../entities/users.entity';
import { UseGuards } from '@nestjs/common';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { UserDataLoader } from '../dataloaders/users.dataloader';
import { MediaService } from 'src/modules/media/services/media.service';
import { CurrentUser } from 'src/decorators/common.decorator';
import { FollowService } from 'src/modules/follow/services/follow.service';

@Resolver(() => User)
export class UsersQueryResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly userDataLoader: UserDataLoader,
    private readonly followService: FollowService,
  ) {}

  @Query(() => User, {
    name: 'me',
  })
  @UseGuards(GqlCookieAuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return this.userService.findById(user.id);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => User, { nullable: true })
  async getUserInfo(@Args('id') id: number): Promise<User | undefined> {
    return await this.userDataLoader.load(id);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => UserConnection)
  async searchUser(
    @CurrentUser() user: User,
    @Args('keyword') keyword: string,
    @Args({ name: 'isRestricted', defaultValue: false }) isRestriced: boolean,
    @Args('limit') limit: number,
    @Args('page') page: number,
  ): Promise<UserConnection> {
    return await this.userService.searchUser(user.id, keyword, isRestriced, limit, page);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => Boolean)
  async isAvailable(@Args('nickname') nickname: string) {
    return await this.userService.isAvailable(nickname);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => [User], { nullable: true, defaultValue: [] })
  async getBlockedUser(@CurrentUser() user: User) {
    return await this.userDataLoader.loadMany(user.blocked);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => [User])
  async getFollowingUser(@CurrentUser() user: User) {
    const following = await this.followService.getListUserFollow(user.id);
    const userId = following.map((item) => item.followUser);
    return await this.userDataLoader.loadMany(userId);
  }
}
