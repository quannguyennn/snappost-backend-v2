import { Resolver } from '@nestjs/graphql';

import { Follow } from '../entities/follow.entity';
import { FollowService } from '../services/follow.service';

@Resolver(() => Follow)
export class FollowQueryResolver {
  constructor(private readonly followService: FollowService) {}
}
