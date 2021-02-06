import { Entity, Column, BaseEntity, DeepPartial, PrimaryGeneratedColumn } from 'typeorm';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';
import { snowflake } from 'src/helpers/common';

@ObjectType({
  implements: [Node],
})
@Entity()
export class Sample extends BaseEntity implements Node {
  @PrimaryGeneratedColumn()
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: number;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  content: string;

  @Field(() => Int)
  @Column('int', {
    default: 0,
  })
  views: number;

  @Column({
    default: true,
  })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(data: DeepPartial<Sample>) {
    super();
    Object.assign(this, { id: snowflake.nextId(), ...data });
  }
}

@ObjectType()
export class SampleConnection extends PaginationBase(Sample) {}
