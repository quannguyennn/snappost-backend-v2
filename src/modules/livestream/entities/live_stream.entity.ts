import { ObjectType } from '@nestjs/graphql';
import { LiveStreamStatusEnum } from 'src/graphql/enums/live_stream/live_stream_status.enum';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType('LiveStream', {
  implements: [Node],
})
@Entity({ name: 'live_streams' })
export class LiveStream extends BaseEntity implements Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  streamerId: number;

  @Column()
  streamUrl: string;

  @Column()
  viewUrl: string;

  @Column({ enum: LiveStreamStatusEnum, default: LiveStreamStatusEnum.IDLE })
  status: LiveStreamStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ObjectType()
export class LiveStreamConnection extends PaginationBase(LiveStream) {}
