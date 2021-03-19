import { Injectable } from '@nestjs/common';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { CreateCommentInput, UpdateCommentInput } from '../dtos/comments.input';
import { CommentConnection, Comments } from '../entities/comment.entity';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  create = async (creatorId: number, input: CreateCommentInput): Promise<Comments> => {
    const newComment = this.commentRepository.create({ creatorId, ...input });
    const saveComment = await this.commentRepository.save(newComment);
    void pubSub.publish(PubsubEventEnum.onCreateComment, { onCreateComment: saveComment });
    return saveComment;
  };

  update = async (input: UpdateCommentInput): Promise<Comments> => {
    await this.commentRepository.update(input.id, input);
    return this.commentRepository.findOneOrFail(input.id);
  };

  remove = async (id: number, postId: number): Promise<boolean> => {
    await this.commentRepository.delete(id);
    void pubSub.publish(PubsubEventEnum.onDeleteComment, { onDeleteComment: { id, postId } });
    return true;
  };

  findPostComments = async (id: number, limit: number, page: number): Promise<CommentConnection> => {
    const [items, total] = await this.commentRepository.findAndCount({
      where: { postId: id },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return createPaginationObject(items, total, page, limit);
  };
}
