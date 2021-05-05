import { Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-errors';
import { LiveStreamStatusEnum } from 'src/graphql/enums/live_stream/live_stream_status.enum';
import { FollowService } from 'src/modules/follow/services/follow.service';
import { MUX_STREAM_URL, MUX_VIEW_EXTENSION, MUX_VIEW_URL } from 'src/modules/livestream/constants';
import { LiveStreamRepository } from 'src/modules/livestream/repositories/live_stream.repository';
import { MuxService } from 'src/modules/livestream/services/mux.service';

@Injectable()
export class LiveStreamService {
  constructor(
    private readonly muxService: MuxService,
    private readonly liveStreamRepo: LiveStreamRepository,
    private readonly followService: FollowService,
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
      });
      return await this.liveStreamRepo.save(newStream);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  changeStreamStatus = async (id: number, status: LiveStreamStatusEnum) => {
    try {
      await this.liveStreamRepo.update({ id }, { status });
      return await this.liveStreamRepo.findOne(id);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };
}
