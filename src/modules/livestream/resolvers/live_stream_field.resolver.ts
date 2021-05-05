import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { LiveStream } from 'src/modules/livestream/entities/live_stream.entity';
import { UserDataLoader } from 'src/modules/users/dataloaders/users.dataloader';
import { User } from 'src/modules/users/entities/users.entity';

@Resolver(() => LiveStream)
export class LiveStreamFieldResolver {
  constructor(private readonly userDataloader: UserDataLoader) {}

  @ResolveField(() => User)
  async streamerInfo(@Parent() stream: LiveStream) {
    return await this.userDataloader.load(stream.streamerId);
  }
}
