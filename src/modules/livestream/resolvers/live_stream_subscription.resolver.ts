import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
import { StreamUser, LiveStream, StreamChat } from 'src/modules/livestream/entities/live_stream.entity';

@Resolver(() => LiveStream)
export class LiveStreamSubscriptionResolver {
  @Subscription(() => StreamUser, {
    filter: (payload, vars) => {
      return Number(payload.onJoinStream.id) === Number(vars.streamId);
    },
  })
  onJoinStream(@Args('streamId') streamId: number) {
    return pubSub.asyncIterator(PubsubEventEnum.onJoinStream);
  }

  @Subscription(() => Number)
  onTest() {
    return pubSub.asyncIterator('onTest');
  }

  @Subscription(() => StreamUser, {
    filter: (payload, vars) => {
      return payload.onLeaveStream.id === vars.streamId;
    },
  })
  onLeaveStream(@Args('streamId') streamId: number) {
    return pubSub.asyncIterator(PubsubEventEnum.onLeaveStream);
  }

  @Subscription(() => StreamChat, {
    filter: (payload, vars) => {
      return payload.onNewStreamChat.id === vars.streamId;
    },
  })
  onNewStreamChat(@Args('streamId') streamId: number) {
    return pubSub.asyncIterator(PubsubEventEnum.onNewStreamChat);
  }
}
