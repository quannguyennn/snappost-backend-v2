import { CommonRepository } from 'src/modules/common/common.repository';
import { EntityRepository } from 'typeorm';
import { Follow } from '../entities/follow.entity';

@EntityRepository(Follow)
export class FollowRepository extends CommonRepository<Follow> {}
