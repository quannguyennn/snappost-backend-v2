import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { Comments } from 'src/modules/comment/entities/comment.entity';
import { CommentService } from 'src/modules/comment/services/comment.service';
import { Post } from '../entities/post.entity';
import { PostService } from '../services/post.service';

@Resolver(() => Post)
export class PostFieldResolver {
  constructor(private readonly postService: PostService, private readonly commentService: CommentService) {}

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => [Comments], { nullable: true })
  async postComments(@Parent() post: Post): Promise<Comments[] | undefined> {
    const comments = this.commentService.findPostComments(post.id);
    return comments;
  }
}
