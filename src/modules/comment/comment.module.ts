import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentDataloader } from './dataloaders/comment.dataloaders';
import { Comments } from './entities/comment.entity';
import { CommentRepository } from './repositories/comment.repository';
import { CommentMutationResolver } from './resolvers/comment_mutation.resolver';
import { CommentQueryResolver } from './resolvers/comment_query.resolver';
import { CommentService } from './services/comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comments, CommentRepository])],
  providers: [CommentMutationResolver, CommentDataloader, CommentQueryResolver, CommentService],
  exports: [CommentService, CommentDataloader],
})
export class CommentModule {}
