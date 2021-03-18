import { ObjectType } from '@nestjs/graphql';
import { FollowStatus } from 'src/graphql/enums/follow/follow_status.enum';
import { PaginationBase, Node } from 'src/graphql/types/common.interface.entity';
import { snowflake } from 'src/helpers/common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeepPartial,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType('Follow', {
  implements: [Node],
})
@Entity({
  name: 'follow',
})
export class Follow extends BaseEntity implements Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  creatorId: number;

  @Column('bigint')
  followUser: number;

  @Column({
    type: 'text',
    enum: FollowStatus,
  })
  status: FollowStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
@ObjectType()
export class FollowConnection extends PaginationBase(Follow) {}
