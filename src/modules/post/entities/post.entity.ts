import { Entity, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType } from '@nestjs/graphql';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';

@ObjectType('Post', {
  implements: [Node],
})
@Entity({
  name: 'posts',
})
export class Post extends BaseEntity implements Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  creatorId: number;

  @Column('text', { array: true })
  medias?: number[];

  @Column({ nullable: true, default: '' })
  caption?: string;

  @Column({ nullable: true, default: '' })
  rawCaption?: string;

  @Column({ default: 0 })
  actualLike: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ObjectType()
export class PostConnection extends PaginationBase(Post) {}
