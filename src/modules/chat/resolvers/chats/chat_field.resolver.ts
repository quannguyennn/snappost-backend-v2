import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { MessageDataloader } from 'src/modules/chat/dataloaders/message.dataloader';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { Message } from 'src/modules/chat/entities/message.entity';
import { UserDataLoader } from 'src/modules/users/dataloaders/users.dataloader';
import { User } from 'src/modules/users/entities/users.entity';

@Resolver(() => Chat)
export class ChatFieldResolver {
  constructor(private readonly userDataloader: UserDataLoader, private readonly messageDataloader: MessageDataloader) {}

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => [User])
  async participantInfo(@Parent() chat: Chat) {
    return await this.userDataloader.loadMany(chat.participants);
  }

  @UseGuards(GqlCookieAuthGuard)
  @ResolveField(() => Message, { nullable: true })
  async lastMessageData(@Parent() chat: Chat) {
    if (!chat.lastMessage) return null;
    return await this.messageDataloader.load(chat.lastMessage ?? 0);
  }
}
