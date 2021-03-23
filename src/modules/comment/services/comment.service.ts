import { Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-errors';
import { EvenEnum } from 'src/graphql/enums/notification/event.enum';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { PostService } from 'src/modules/post/services/post.service';
import { DeepPartial } from 'typeorm';
import { CreateCommentInput, UpdateCommentInput } from '../dtos/comments.input';
import { CommentConnection, Comments } from '../entities/comment.entity';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly notificationService: NotificationService,
    private readonly postService: PostService,
  ) { }

  create = async (creatorId: number, input: DeepPartial<Comments>): Promise<Comments> => {
    const postInfo = await this.postService.findById(input.postId ?? 0);
    if (!postInfo) throw new ApolloError('Not found');

    const newComment = this.commentRepository.create({ creatorId, ...input });
    const saveComment = await this.commentRepository.save(newComment);
    await this.notificationService.create(creatorId, postInfo?.creatorId, EvenEnum.comment, `post-${postInfo?.id}`);
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
