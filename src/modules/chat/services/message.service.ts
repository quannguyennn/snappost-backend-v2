import { Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-errors';
import { PubsubEventEnum } from 'src/graphql/enums/pubsub/pubsub_event.enum';
import { pubSub } from 'src/helpers/pubsub';
import { Message } from 'src/modules/chat/entities/message.entity';
import { MessageRepository } from 'src/modules/chat/repositories/message.repository';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { DeepPartial } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepo: MessageRepository) {}

  getMessage = async (chatId: number, limit: number, page: number) => {
    try {
      const [items, total] = await this.messageRepo.findAndCount({
        where: { chatId },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return createPaginationObject(items, total, page, limit);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };

  sendMessage = async (senderId: number, data: DeepPartial<Message>) => {
    try {
      const newMessage = await this.messageRepo.create({ ...data, sender: senderId });
      const savedMessage = await this.messageRepo.save(newMessage);
      void pubSub.publish(PubsubEventEnum.onNewMessage, { onNewMessage: savedMessage });
      return savedMessage;
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };
}
