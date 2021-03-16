import { ObjectType } from '@nestjs/graphql';
import { Node } from 'src/graphql/types/common.interface.entity';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType({
  implements: [Node],
})
@Entity({
  name: 'likes',
})
export class Like implements Node {
  @PrimaryGeneratedColumn()
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: number;

  @Column()
  postId: number;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
