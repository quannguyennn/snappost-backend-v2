import { Injectable } from '@nestjs/common';
import { FollowStatus } from 'src/graphql/enums/follow/follow_status.enum';
import { EvenEnum } from 'src/graphql/enums/notification/event.enum';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { FollowUserInput } from '../dtos/follow.input';
import { Follow } from '../entities/follow.entity';
import { FollowRepository } from '../repositories/follow.repository';

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly notificationService: NotificationService,
  ) {}

  checkFollowStatus = async (creatorId: number, followUser: number): Promise<FollowStatus | undefined> => {
    const follow = await this.followRepository.findOne({ creatorId, followUser });
    if (!follow) return undefined;
    else {
      return follow.status;
    }
  };

  //ng minh follow
  getListUserFollow = async (creatorId: number): Promise<Follow[]> => {
    const listUserFollow = await this.followRepository.find({ where: { creatorId, status: FollowStatus.ACCEPT } });
    return listUserFollow;
  };

  //follow minh
  getListUserFollowing = async (followUser: number): Promise<Follow[]> => {
    const listUserFollow = await this.followRepository.find({ where: { followUser, status: FollowStatus.ACCEPT } });
    return listUserFollow;
  };

  getFollowingUserId = async (creatorId: number): Promise<number[]> => {
    const followingUser = await this.followRepository.find({ where: { creatorId, status: FollowStatus.ACCEPT } });
    return followingUser.map((item) => item.followUser);
  };

  getFollowerUserId = async (followUser: number): Promise<number[]> => {
    const followingUser = await this.followRepository.find({ where: { followUser, status: FollowStatus.ACCEPT } });
    return followingUser.map((item) => item.followUser);
  };

  followUser = async (creatorId: number, input: FollowUserInput): Promise<boolean> => {
    const newFollowRequest = this.followRepository.create({ creatorId, ...input });
    await this.followRepository.save(newFollowRequest);
    await this.notificationService.create(creatorId, input.followUser, EvenEnum.follow, `user-${creatorId}`);
    return true;
  };

  unFollowUser = async (creatorId: number, unFollowUserId: number): Promise<boolean> => {
    const unFollowRequest = await this.followRepository.findOne({ where: { creatorId, followUser: unFollowUserId } });
    if (unFollowRequest) {
      await this.followRepository.delete(unFollowRequest.id);
    }
    return true;
  };

  handleFollowRequest = async (creatorId: number, followeeId: number, accept: boolean) => {
    try {
      const follow = await this.followRepository.findOne({
        creatorId,
        followUser: followeeId,
        status: FollowStatus.WAITING,
      });
      if (!follow) throw new Error('not found');
      if (accept) {
        await this.followRepository.update({ id: follow.id }, { status: FollowStatus.ACCEPT });
        await this.notificationService.create(followeeId, creatorId, EvenEnum.acceptFollow, `user-${followeeId}`);
      } else {
        await this.followRepository.delete({ id: follow.id });
      }
      return accept;
    } catch (error) {
      throw new Error(error.message);
    }
  };
}
