import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from '../comment/comment.module';
import { PostDataloader } from './dataloaders/post.dataloaders';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';
import { PostFieldResolver } from './resolvers/post_field.resolver';
import { PostMutationResolver } from './resolvers/post_mutation.resolver';
import { PostQueryResolver } from './resolvers/post_query.resolver';
import { PostService } from './services/post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostRepository]), forwardRef(() => CommentModule)],
  providers: [PostMutationResolver, PostService, PostQueryResolver, PostDataloader, PostFieldResolver],
  exports: [PostService, PostDataloader],
})
export class PostModule {}
