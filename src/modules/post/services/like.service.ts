import { Injectable } from '@nestjs/common';
import { LikeRepository } from '../repositories/like.repository';

@Injectable()
export class LikeService {
  constructor(private readonly likeRepository: LikeRepository) {}

  countPostLike = async (postId: number): Promise<number> => {
    return await this.likeRepository.count({ postId });
  };

  isLike = async (userId: number, postId: number): Promise<boolean> => {
    const like = await this.likeRepository.findOne({ userId, postId });
    return like ? true : false;
  };
}
