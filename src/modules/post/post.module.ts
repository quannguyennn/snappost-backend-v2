import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from '../comment/comment.module';
import { FollowModule } from '../follow/follow.module';
import { MediaModule } from '../media/media.module';
import { UsersModule } from '../users/users.module';
import { PostDataloader } from './dataloaders/post.dataloaders';
import { Like } from './entities/like.entity';
import { Post } from './entities/post.entity';
import { LikeRepository } from './repositories/like.repository';
import { PostRepository } from './repositories/post.repository';
import { PostFieldResolver } from './resolvers/post_field.resolver';
import { PostMutationResolver } from './resolvers/post_mutation.resolver';
import { PostQueryResolver } from './resolvers/post_query.resolver';
import { LikeService } from './services/like.service';
import { PostService } from './services/post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostRepository, Like, LikeRepository]),
    forwardRef(() => CommentModule),
    forwardRef(() => FollowModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MediaModule),
  ],
  providers: [PostMutationResolver, PostService, PostQueryResolver, PostDataloader, PostFieldResolver, LikeService],
  exports: [PostService, PostDataloader, LikeService],
})
export class PostModule {}
