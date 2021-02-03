import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { MediaService } from 'src/modules/media/services/media.service';
import { User } from '../entities/users.entity';
import { UsersService } from '../services/users.service';

@Resolver(() => User)
export class UserFieldResolver {
  constructor(private readonly userService: UsersService, private readonly mediaService: MediaService) {}

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => String, { nullable: true })
  async avatarFilePath(@Parent() user: User): Promise<string | undefined> {
    const image = await this.mediaService.findById(user.avatar || '');
    return image?.filePath;
  }

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => String, { nullable: true })
  test(@Parent() user: User): string | undefined {
    return 's';
  }
}
