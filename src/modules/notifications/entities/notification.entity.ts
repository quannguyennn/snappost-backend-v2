import { ObjectType } from '@nestjs/graphql';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({
  implements: [Node],
})
@Entity({
  name: 'notification',
})
export class Notification extends BaseEntity implements Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  triggerId: number;

  @Column()
  userId: number;

  @Column()
  content: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  isSeen: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@ObjectType()
export class NotificationConnection extends PaginationBase(Notification) {}
