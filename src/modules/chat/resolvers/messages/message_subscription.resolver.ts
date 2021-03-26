import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
import { Message } from 'src/modules/chat/entities/message.entity';

@Resolver(() => Message)
export class MessageSubscriptionResolver {
  @Subscription(() => Message, {
    filter: (payload, vars, context) => {
      return payload.onNewMessage.chatId === vars.chatId;
    },
  })
  onNewMessage(@Args('chatId') chatId: number) {
    return pubSub.asyncIterator(PubsubEventEnum.onNewMessage);
  }
}
