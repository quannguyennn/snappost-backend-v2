import { Injectable } from '@nestjs/common';
import { FollowUserInput } from '../dtos/follow.input';
import { Follow } from '../entities/follow.entity';
import { FollowRepository } from '../repositories/follow.repository';

@Injectable()
export class FollowService {
  constructor(private readonly followRepository: FollowRepository) {}

  getListUserFollow = async (creatorId: number): Promise<Follow[]> => {
    const listUserFollow = await this.followRepository.find({ where: { creatorId } });
    return listUserFollow;
  };
  followUser = async (creatorId: number, input: FollowUserInput): Promise<boolean> => {
    const newFollowRequest = this.followRepository.create({ creatorId, ...input });
    await this.followRepository.save(newFollowRequest);
    return true;
  };

  unFollowUser = async (creatorId: number, unFollowUserId: number): Promise<boolean> => {
    const unFollowRequest = await this.followRepository.findOne({ where: { creatorId, followUser: unFollowUserId } });
    if (unFollowRequest) {
      await this.followRepository.delete(unFollowRequest.id);
    }
    return true;
  };
}
