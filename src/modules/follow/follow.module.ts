import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { FollowRepository } from './repositories/follow.repository';
import { FollowMutationResolver } from './resolvers/follow_mutation.resolver';
import { FollowQueryResolver } from './resolvers/follow_query.resolver';
import { FollowService } from './services/follow.service';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, FollowRepository])],
  providers: [FollowMutationResolver, FollowQueryResolver, FollowService],
  exports: [FollowService],
})
export class FollowModule {}
