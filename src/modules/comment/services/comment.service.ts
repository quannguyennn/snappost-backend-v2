import { Injectable } from '@nestjs/common';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
import { CreateCommentInput, UpdateCommentInput } from '../dtos/comments.input';
import { Comments } from '../entities/comment.entity';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  create = async (creatorId: number, input: CreateCommentInput): Promise<Comments> => {
    const newComment = this.commentRepository.create({ creatorId, ...input });
    void pubSub.publish(PubsubEventEnum.onCreateComment, { onCreateComment: newComment });
    return await this.commentRepository.save(newComment);
  };

  update = async (input: UpdateCommentInput): Promise<Comments> => {
    await this.commentRepository.update(input.id, input);
    return this.commentRepository.findOneOrFail(input.id);
  };

  remove = async (id: number): Promise<boolean> => {
    await this.commentRepository.delete(id);
    return true;
  };

  findPostComments = async (id: number): Promise<Comments[]> => {
    return this.commentRepository.find({ where: { postId: id } });
  };
}
