import { Query, UseGuards } from '@nestjs/common';
import { Args, Resolver } from '@nestjs/graphql';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { PostDataloader } from '../dataloaders/post.dataloaders';
import { PostArgs } from '../dtos/post.args';
import { Post, PostConnection } from '../entities/post.entity';
import { PostService } from '../services/post.service';

@Resolver(() => Post)
export class PostQueryResolver {
  constructor(private readonly postService: PostService, private readonly postDataLoader: PostDataloader) {}

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => PostConnection, { name: 'posts', nullable: true })
  async post(@Args() args: PostArgs): Promise<PostConnection> {
    return await this.postService.pagination({
      page: args.page,
      limit: args.limit,
    });
  }
}
