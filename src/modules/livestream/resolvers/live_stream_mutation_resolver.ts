import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/common.decorator';
import { LiveStreamStatusEnum } from 'src/graphql/enums/live_stream/live_stream_status.enum';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { pubSub } from 'src/helpers/pubsub';
import { LiveStream, StreamChat } from 'src/modules/livestream/entities/live_stream.entity';
import { LiveStreamService } from 'src/modules/livestream/services/live_stream.service';
import { User } from 'src/modules/users/entities/users.entity';

@Resolver(() => LiveStream)
export class LiveStreamMutationResolver {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => LiveStream)
  async createLiveStream(@CurrentUser() user: User) {
    return await this.liveStreamService.createStream(user.id);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => LiveStream)
  async changeStreamStatus(
    @Args('id') id: number,
    @Args({ name: 'status', type: () => LiveStreamStatusEnum }) status: LiveStreamStatusEnum,
  ) {
    return await this.liveStreamService.changeStreamStatus(id, status);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => Boolean)
  async joinStream(@Args('id') id: number, @CurrentUser() user: User) {
    return await this.liveStreamService.joinStream(id, user);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => Boolean)
  async leaveStream(@Args('id') id: number, @CurrentUser() user: User) {
    return await this.liveStreamService.leaveStream(id, user);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => StreamChat)
  async sendStreamChat(
    @Args('streamId') streamId: number,
    @Args('chat') chat: string,
    @CurrentUser() user: User,
    @Args('isSystem') isSystem?: boolean,
  ) {
    return await this.liveStreamService.sendStreamChat(streamId, chat, isSystem, user.id);
  }
}
