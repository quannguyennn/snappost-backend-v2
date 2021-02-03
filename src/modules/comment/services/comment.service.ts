import { Injectable } from '@nestjs/common';
import { CreateCommentInput, UpdateCommentInput } from '../dtos/comments.input';
import { Comments } from '../entities/comment.entity';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  create = async (creatorId: string, input: CreateCommentInput): Promise<Comments> => {
    const newComment = this.commentRepository.create({ creatorId, ...input });
    return await this.commentRepository.save(newComment);
  };

  update = async (input: UpdateCommentInput): Promise<Comments> => {
    await this.commentRepository.update(input.id, input);
    return this.commentRepository.findOneOrFail(input.id);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.commentRepository.delete(id);
    return true;
  };

  findPostComments = async (id: string): Promise<Comments[]> => {
    return this.commentRepository.find({ where: { postId: id } });
  };
}
