import { Resolver, Args, Query } from '@nestjs/graphql';
import { UsersService } from '../services/users.service';
import { User, UserConnection } from '../entities/users.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AppRoles } from 'src/graphql/enums/roles.type';
import { UserDataLoader } from '../dataloaders/users.dataloader';
import { MediaService } from 'src/modules/media/services/media.service';
import { MediaEntity } from 'src/modules/media/entities/media.entity';
import { CurrentUser } from 'src/decorators/common.decorator';
import { UserActiveEnum } from 'src/graphql/enums/users/user_active.enum';

@Resolver(() => User)
export class UsersQueryResolver {
  constructor(
    private readonly userService: UsersService,
    private readonly userDataLoader: UserDataLoader,
    private readonly mediaService: MediaService,
  ) {}

  @Query(() => User, {
    name: 'me',
  })
  @UseGuards(GqlCookieAuthGuard, RolesGuard)
  whoAmI(@CurrentUser() user: User) {
    return this.userService.findById(user.id);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => User, { name: 'user', nullable: true })
  async user(@Args('id') id: string): Promise<User | undefined> {
    return await this.userDataLoader.load(id);
  }

  @Roles(AppRoles.ADMIN)
  @UseGuards(GqlCookieAuthGuard, RolesGuard)
  @Query(() => UserConnection, { name: 'users', nullable: true })
  users(
    @Args('limit') limit: number,
    @Args('page') page: number,
    @Args('keyword') keyword?: string,
    @Args({ name: 'roles', type: () => AppRoles }) roles?: AppRoles,
    @Args('startDate') startDate?: string,
    @Args('endDate') endDate?: string,
    @Args({ name: 'active', type: () => UserActiveEnum }) active?: UserActiveEnum,
  ): Promise<UserConnection> {
    return this.userService.pagination(limit, page, keyword, roles, startDate, endDate, active);
  }
}
