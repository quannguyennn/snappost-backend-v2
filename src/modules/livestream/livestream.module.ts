import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowModule } from 'src/modules/follow/follow.module';
import { LiveStream } from 'src/modules/livestream/entities/live_stream.entity';
import { LiveStreamRepository } from 'src/modules/livestream/repositories/live_stream.repository';
import { LiveStreamFieldResolver } from 'src/modules/livestream/resolvers/live_stream_field.resolver';
import { LiveStreamMutationResolver } from 'src/modules/livestream/resolvers/live_stream_mutation_resolver';
import { LiveStreamQueryResolver } from 'src/modules/livestream/resolvers/live_stream_query.resolver';
import { LiveStreamSubscriptionResolver } from 'src/modules/livestream/resolvers/live_stream_subscription.resolver';
import { LiveStreamService } from 'src/modules/livestream/services/live_stream.service';
import { MuxService } from 'src/modules/livestream/services/mux.service';
import { MediaModule } from 'src/modules/media/media.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LiveStream, LiveStreamRepository]),
    forwardRef(() => FollowModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MediaModule),
  ],
  exports: [LiveStreamService],
  providers: [
    LiveStreamMutationResolver,
    LiveStreamService,
    MuxService,
    LiveStreamQueryResolver,
    LiveStreamFieldResolver,
    LiveStreamSubscriptionResolver,
  ],
})
export class LiveStreamModule {}
