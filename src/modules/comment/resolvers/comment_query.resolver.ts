import { Resolver } from '@nestjs/graphql';
import { CommentDataloader } from '../dataloaders/comment.dataloaders';
import { Comments } from '../entities/comment.entity';
import { CommentService } from '../services/comment.service';

@Resolver(() => Comments)
export class CommentQueryResolver {
  constructor(private readonly commentService: CommentService, private readonly commentDataloader: CommentDataloader) {}
}
