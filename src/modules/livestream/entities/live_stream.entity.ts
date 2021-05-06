import { Field, ObjectType } from '@nestjs/graphql';
import { LiveStreamStatusEnum } from 'src/graphql/enums/live_stream/live_stream_status.enum';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';
import { User } from 'src/modules/users/entities/users.entity';
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

  @Column({ nullable: true, default: '' })
  previewUrl?: string;

  @Column({ default: '' })
  muxStreamId: string;

  @Column({ default: '' })
  muxPlaybackId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ObjectType()
export class StreamUser {
  @Field({ description: 'stream id' })
  id: number;

  @Field()
  userId?: number;

  @Field()
  name?: string;

  @Field()
  avatar?: string;
}

@ObjectType()
export class StreamChat extends StreamUser {
  @Field()
  chat: string;

  @Field({ defaultValue: false })
  isSystem: boolean;
}

@ObjectType()
export class LiveStreamConnection extends PaginationBase(LiveStream) {}
