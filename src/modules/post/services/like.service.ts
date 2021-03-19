import { Injectable } from '@nestjs/common';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
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

  reactToPost = async (userId: number, postId: number) => {
    const reaction = await this.likeRepository.findOne({ userId, postId });
    if (!reaction) {
      const newReact = this.likeRepository.create({ userId, postId });
      const savedReact = await this.likeRepository.save(newReact);
      void pubSub.publish(PubsubEventEnum.onLikePost, { onLikePost: savedReact });
    } else {
      void pubSub.publish(PubsubEventEnum.onUnLikePost, { onUnLikePost: reaction });
      await this.likeRepository.delete(reaction.id);
    }
    return reaction ? false : true;
  };

  getUserIdLikePost = async (postId: number) => {
    const likes = await this.likeRepository.find({ where: { postId }, order: { createdAt: 'DESC' } });
    return likes.map((like) => like.userId);
  };
}
