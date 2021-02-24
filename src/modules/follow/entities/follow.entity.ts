import { ObjectType } from '@nestjs/graphql';
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

export enum FollowStatus {
  WAITING = 'Waiting',
  ACCEPT = 'Accept',
  REJECT = 'Reject',
}

@ObjectType('Follow', {
  implements: [Node],
})
@Entity({
  name: 'follow',
})
export class Follow extends BaseEntity implements Node {
  @PrimaryGeneratedColumn()
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: number;

  @Column('bigint')
  creatorId: number;

  @Column('bigint')
  followUser: number;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: DeepPartial<Follow>) {
    super();
    Object.assign(this, { id: snowflake.nextId(), ...partial });
  }
}
@ObjectType()
export class FollowConnection extends PaginationBase(Follow) {}
