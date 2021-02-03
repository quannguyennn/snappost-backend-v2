import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';
import { PostMutationResolver } from './resolvers/post_mutation.resolver';
import { PostService } from './services/post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostRepository])],
  exports: [PostService],
  providers: [PostMutationResolver, PostService],
})
export class PostModule {}
