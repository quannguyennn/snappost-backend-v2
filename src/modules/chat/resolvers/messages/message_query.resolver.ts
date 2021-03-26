import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { Message, MessageConnection } from 'src/modules/chat/entities/message.entity';
import { MessageService } from 'src/modules/chat/services/message.service';

@Resolver(() => Message)
export class MessageQueryResolver {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => MessageConnection)
  async getMessage(@Args('chatId') chatId: number, @Args('limit') limit: number, @Args('page') page: number) {
    return await this.messageService.getMessage(chatId, limit, page);
  }
}
