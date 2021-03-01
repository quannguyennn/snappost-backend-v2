import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { Comments } from 'src/modules/comment/entities/comment.entity';
import { CommentService } from 'src/modules/comment/services/comment.service';
import { User } from 'src/modules/users/entities/users.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { Post } from '../entities/post.entity';
import { PostService } from '../services/post.service';

@Resolver(() => Post)
export class PostFieldResolver {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => [Comments], { nullable: true })
  async postComments(@Parent() post: Post): Promise<Comments[] | undefined> {
    const comments = this.commentService.findPostComments(post.id);
    return comments;
  }

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => User, { nullable: true })
  async creatorInfo(@Parent() post: Post): Promise<User | undefined> {
    const user = this.userService.findById(post.creatorId);
    return user;
  }
}
