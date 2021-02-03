import { Entity, Column, DeepPartial, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';
import { snowflake } from 'src/helpers/common';

@ObjectType('Post', {
  implements: [Node],
})
@Entity({
  name: 'posts',
})
export class Post extends BaseEntity implements Node {
  @Field(() => ID)
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: string;

  @Column('bigint')
  creatorId: string;

  @Column('bigint', { array: true })
  medias?: string[];

  @Column()
  caption: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: DeepPartial<Post>) {
    super();
    Object.assign(this, { id: snowflake.nextId(), ...partial });
  }
}

@ObjectType()
export class PostConnection extends PaginationBase(Post) {}
