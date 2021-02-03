import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from './entities/comment.entity';
import { CommentRepository } from './repositories/comment.repository';
import { CommentMutationResolver } from './resolvers/comment_mutation.resolver';
import { CommentService } from './services/comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comments, CommentRepository])],
  exports: [CommentService, Comments],
  providers: [CommentMutationResolver, CommentService],
})
export class CommentModule {}
