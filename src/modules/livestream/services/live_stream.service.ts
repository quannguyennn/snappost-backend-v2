import { Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-errors';
import { LiveStreamStatusEnum } from 'src/graphql/enums/live_stream/live_stream_status.enum';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
import { FollowService } from 'src/modules/follow/services/follow.service';
import { MUX_GIF_URL, MUX_STREAM_URL, MUX_VIEW_EXTENSION, MUX_VIEW_URL } from 'src/modules/livestream/constants';
import { StreamChat } from 'src/modules/livestream/entities/live_stream.entity';
import { LiveStreamRepository } from 'src/modules/livestream/repositories/live_stream.repository';
import { MuxService } from 'src/modules/livestream/services/mux.service';
import { MediaService } from 'src/modules/media/services/media.service';
import { User } from 'src/modules/users/entities/users.entity';
import { UsersService } from 'src/modules/users/services/users.service';

@Injectable()
export class LiveStreamService {
  constructor(
    private readonly muxService: MuxService,
    private readonly liveStreamRepo: LiveStreamRepository,
    private readonly followService: FollowService,
    private readonly userService: UsersService,
    private readonly mediaService: MediaService,
  ) {}

  getStreams = async (userId: number) => {
    try {
      const followingUser = await this.followService.getFollowingUserId(userId);
      const query = this.liveStreamRepo
        .createQueryBuilder('streams')
        .andWhere('streams.status = :status', { status: LiveStreamStatusEnum.ACTIVE })
        .orderBy('streams.createdAt', 'DESC');
      if (followingUser.length) query.andWhere('streams.streamerId IN (:...users)', { users: followingUser });
      return await query.getMany();
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };

  streamDetail = async (id: number) => {
    try {
      return await this.liveStreamRepo.findOne(id);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };

  createStream = async (streamerId: number) => {
    try {
      const muxStream = await this.muxService.createStream();
      if (!muxStream.playback_ids?.length) {
        throw new Error('Playback ID not found');
      }
      const newStream = await this.liveStreamRepo.create({
        streamerId,
        streamUrl: MUX_STREAM_URL + muxStream.stream_key,
        viewUrl: MUX_VIEW_URL + muxStream.playback_ids[0].id + MUX_VIEW_EXTENSION,
        muxStreamId: muxStream.id,
        muxPlaybackId: muxStream.playback_ids[0].id,
      });
      return await this.liveStreamRepo.save(newStream);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  changeStreamStatus = async (id: number, status: LiveStreamStatusEnum) => {
    try {
      const stream = await this.liveStreamRepo.findOne(id);
      if (!stream) throw new ApolloError('Stream not found');
      if (status === LiveStreamStatusEnum.ACTIVE) {
        await this.liveStreamRepo.update(
          { id },
          {
            status,
            previewUrl: MUX_GIF_URL(stream.muxPlaybackId, 'width=640&fps=30'),
          },
        );
      } else {
        await this.muxService.disable(stream.muxStreamId);
        await this.liveStreamRepo.update(
          { id },
          {
            status,
          },
        );
      }
      return await this.liveStreamRepo.findOne(id);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };

  joinStream = async (id: number, user: User) => {
    const userInfo = await this.userService.findById(user.id);
    const avatar = await this.mediaService.findById(userInfo?.avatar ?? 0);
    if (!userInfo) throw new Error('user not found');
    pubSub.publish(PubsubEventEnum.onJoinStream, {
      onJoinStream: { id: id, userId: userInfo.id, name: userInfo.name, avatar: avatar?.filePath },
    });
    return true;
  };

  leaveStream = async (id: number, user: User) => {
    const userInfo = await this.userService.findById(user.id);
    const avatar = await this.mediaService.findById(userInfo?.avatar ?? 0);
    if (!userInfo) throw new Error('user not found');
    pubSub.publish(PubsubEventEnum.onLeaveStream, {
      onLeaveStream: { id: id, userId: userInfo.id, name: userInfo.name, avatar: avatar?.filePath },
    });
    return true;
  };

  sendStreamChat = async (streamId: number, chat: string, isSystem: boolean = false, userId: number) => {
    const userInfo = await this.userService.findById(userId);
    const avatar = await this.mediaService.findById(userInfo?.avatar ?? 0);
    if (!userInfo) throw new Error('user not found');
    pubSub.publish(PubsubEventEnum.onNewStreamChat, {
      onNewStreamChat: {
        id: streamId,
        userId: userInfo.id ?? 0,
        name: userInfo.name ?? '',
        avatar: avatar?.filePath ?? '',
        chat,
        isSystem,
      },
    });
    return {
      id: streamId,
      userId: userInfo.id,
      name: userInfo.name,
      avatar: avatar?.filePath,
      chat,
      isSystem,
    };
  };
}
