import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/common.decorator';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { LiveStream } from 'src/modules/livestream/entities/live_stream.entity';
import { LiveStreamService } from 'src/modules/livestream/services/live_stream.service';
import { User } from 'src/modules/users/entities/users.entity';

@Resolver(() => LiveStream)
export class LiveStreamQueryResolver {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => [LiveStream])
  async getStreams(@CurrentUser() user: User) {
    return await this.liveStreamService.getStreams(user.id);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Query(() => LiveStream)
  async getStreamDetail(@Args('id') id: number) {
    return await this.liveStreamService.streamDetail(id);
  }
}
