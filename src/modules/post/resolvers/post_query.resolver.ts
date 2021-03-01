import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/common.decorator';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { Pagination } from 'src/modules/common/pagination';
import { User } from 'src/modules/users/entities/users.entity';
import { PostDataloader } from '../dataloaders/post.dataloaders';
import { PostArgs } from '../dtos/post.args';
import { Post, PostConnection } from '../entities/post.entity';
import { PostService } from '../services/post.service';

@Resolver(() => Post)
export class PostQueryResolver {
  constructor(private readonly postService: PostService, private readonly postDataLoader: PostDataloader) {}

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => Post, { name: 'posts', nullable: true })
  async post(@CurrentUser() user: User, @Args() args: PostArgs): Promise<PostConnection> {
    return await this.postService.getListPost(user.id, args.page, args.limit);
  }
}
