import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/common.decorator';
import { FollowStatus } from 'src/graphql/enums/follow/follow_status.enum';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { Follow } from 'src/modules/follow/entities/follow.entity';
import { FollowService } from 'src/modules/follow/services/follow.service';
import { MediaService } from 'src/modules/media/services/media.service';
import { UserDataLoader } from '../dataloaders/users.dataloader';
import { User } from '../entities/users.entity';
import { UsersService } from '../services/users.service';

@Resolver(() => User)
export class UserFieldResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly mediaService: MediaService,
    private readonly followService: FollowService,
    private readonly userDataloader: UserDataLoader,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async avatarFilePath(@Parent() user: User): Promise<string | undefined> {
    const image = await this.mediaService.findById(Number(user.avatar));
    return image?.filePath;
  }

  @ResolveField(() => FollowStatus, { nullable: true })
  async followStatus(@CurrentUser() me: User, @Parent() user: User): Promise<FollowStatus | undefined> {
    if (user.id === me.id) return undefined;
    else {
      return await this.followService.checkFollowStatus(me.id, user.id);
    }
  }

  @ResolveField(() => [User], { nullable: true, defaultValue: [] })
  async nFollowing(@CurrentUser() user: User): Promise<(User | Error)[]> {
    const following = await this.followService.getListUserFollow(user.id);
    const userId = following.map((item) => item.followUser);
    return await this.userDataloader.loadMany(userId);
  }

  @ResolveField(() => [User], { nullable: true, defaultValue: [] })
  async nFollower(@CurrentUser() user: User): Promise<(User | Error)[]> {
    const follower = await this.followService.getListUserFollowing(user.id);
    const userId = follower.map((item) => item.creatorId);
    return await this.userDataloader.loadMany(userId);
  }
}
