import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/common.decorator';
import { FollowStatus } from 'src/graphql/enums/follow/follow_status.enum';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { FollowService } from 'src/modules/follow/services/follow.service';
import { MediaService } from 'src/modules/media/services/media.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { UserDataLoader } from '../dataloaders/users.dataloader';
import { User } from '../entities/users.entity';

@Resolver(() => User)
export class UserFieldResolver {
  constructor(
    private readonly mediaService: MediaService,
    private readonly followService: FollowService,
    private readonly userDataloader: UserDataLoader,
    private readonly userService: UsersService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async avatarFilePath(@Parent() user: User): Promise<string | undefined> {
    const image = await this.mediaService.findById(Number(user.avatar));
    return image?.filePath;
  }

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => Boolean)
  async isRequestFollowMe(@CurrentUser() me: User, @Parent() user: User) {
    if (me.id === user.id) return false;
    else {
      const followStatus = await this.followService.checkFollowStatus(user.id, me.id);
      if (followStatus === FollowStatus.WAITING) {
        return true;
      } else {
        return false;
      }
    }
  }

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => Boolean)
  async isBlockMe(@CurrentUser() me: User, @Parent() user: User) {
    if (me.id === user.id) return false;
    else {
      const userBlockMe = await this.userService.getPeopleBlockUserId(me.id);

      return userBlockMe.includes(user.id);
    }
  }

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => FollowStatus, { nullable: true })
  async followStatus(@CurrentUser() me: User, @Parent() user: User): Promise<FollowStatus | undefined | null> {
    if (user.id === me.id) {
      return FollowStatus.IS_ME;
    } else {
      return await this.followService.checkFollowStatus(me.id, user.id);
    }
  }

  @ResolveField(() => [User], { nullable: true, defaultValue: [] })
  async nFollowing(@Parent() user: User): Promise<(User | Error)[]> {
    const following = await this.followService.getListUserFollow(user.id);
    const userId = following.map((item) => item.followUser);
    return await this.userDataloader.loadMany(userId);
  }

  @ResolveField(() => [User], { nullable: true, defaultValue: [] })
  async nFollower(@Parent() user: User): Promise<(User | Error)[]> {
    const follower = await this.followService.getListUserFollowing(user.id);
    const userId = follower.map((item) => item.creatorId);
    return await this.userDataloader.loadMany(userId);
  }
}
