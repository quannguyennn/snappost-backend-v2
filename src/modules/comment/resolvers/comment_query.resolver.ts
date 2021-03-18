import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { CommentDataloader } from '../dataloaders/comment.dataloaders';
import { CommentConnection, Comments } from '../entities/comment.entity';
import { CommentService } from '../services/comment.service';

@Resolver(() => Comments)
export class CommentQueryResolver {
  constructor(private readonly commentService: CommentService, private readonly commentDataloader: CommentDataloader) { }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => CommentConnection, { defaultValue: [] })
  async getPostComment(@Args("postId") postId: number, @Args("limit") limit: number, @Args("page") page: number) {
    return await this.commentService.findPostComments(postId, limit, page)
  }
}
