import { Injectable } from '@nestjs/common';
import { async } from 'rxjs/internal/scheduler/async';
import { FollowStatus } from 'src/graphql/enums/follow/follow_status.enum';
import { FollowUserInput } from '../dtos/follow.input';
import { Follow } from '../entities/follow.entity';
import { FollowRepository } from '../repositories/follow.repository';

@Injectable()
export class FollowService {
  constructor(private readonly followRepository: FollowRepository) {}

  checkFollowStatus = async (creatorId: number, followUser: number): Promise<FollowStatus | undefined> => {
    const follow = await this.followRepository.findOne({ creatorId, followUser });
    if (!follow) return undefined;
    else {
      return follow.status;
    }
  };

  getListUserFollow = async (creatorId: number): Promise<Follow[]> => {
    const listUserFollow = await this.followRepository.find({ where: { creatorId } });
    return listUserFollow;
  };

  getFollowingUserId = async (creatorId: number): Promise<number[]> => {
    const followingUser = await this.followRepository.find({ where: { creatorId, status: FollowStatus.ACCEPT } });
    return followingUser.map((item) => item.followUser);
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
