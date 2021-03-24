import { Injectable } from '@nestjs/common';
import { Message } from 'src/modules/chat/entities/message.entity';
import { ChatRepository } from 'src/modules/chat/repositories/chat.repository';
import { createPaginationObject } from 'src/modules/common/common.repository';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  getChats = async (userId: number, limit: number, page: number) => {
    try {
      const [items, total] = await this.chatRepository
        .createQueryBuilder('chat')
        .where('chat.participants && ARRAY[:...userId]', { userId: [userId] })
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy('chat.updatedAt', 'DESC')
        .getManyAndCount();
      return createPaginationObject(items, total, page, limit);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getExist = async (participants: number[]) => {
    try {
      return await this.chatRepository
        .createQueryBuilder('chat')
        .where('chat.participants && ARRAY[:...users]', { users: participants })
        .getOne();
    } catch (error) {
      throw new Error(error.message);
    }
  };

  create = async (participants: number[]) => {
    try {
      const newChat = await this.chatRepository.create({ participants });
      return await this.chatRepository.save(newChat);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  remove = async (id: number) => {
    try {
      await this.chatRepository.delete(id);
      return id;
    } catch (error) {
      throw new Error(error.message);
    }
  };
}
