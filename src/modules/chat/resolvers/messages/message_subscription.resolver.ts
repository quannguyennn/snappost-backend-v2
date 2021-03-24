import { Resolver } from '@nestjs/graphql';
import { Message } from 'src/modules/chat/entities/message.entity';

@Resolver(() => Message)
export class MessageSubscriptionResolver {}
