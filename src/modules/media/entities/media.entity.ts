import {
  Column,
  Entity,
  Tree,
  TreeChildren,
  TreeParent,
  BaseEntity,
  DeepPartial,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, HideField, ID } from '@nestjs/graphql';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';
import { FileTypeEnum } from 'src/graphql/enums/file_type';
import { snowflake } from 'src/helpers/common';

@ObjectType('Media', {
  implements: [Node],
})
@Entity({
  name: 'media',
})
@Tree('closure-table')
export class MediaEntity extends BaseEntity implements Node {
  @PrimaryGeneratedColumn()
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500, nullable: true })
  filePath?: string;

  @Column({ length: 100, nullable: true })
  mimeType?: string;

  @Field(() => Int)
  @Column({ type: 'int4', unsigned: true, nullable: true })
  fileSize?: number;

  @Column({
    default: false,
  })
  isDeleted: boolean;

  @Column({ nullable: true })
  ownerId?: number;

  @Column({
    type: 'enum',
    default: FileTypeEnum.FILE,
    enum: FileTypeEnum,
  })
  type: FileTypeEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @HideField()
  @TreeChildren({ cascade: true })
  children: MediaEntity[];

  @HideField()
  @TreeParent()
  parent?: MediaEntity;

  constructor(data: DeepPartial<MediaEntity>) {
    super();
    Object.assign(this, { id: snowflake.nextId(), ...data });
  }
}

@ObjectType('MediaConnection')
export class MediaConnection extends PaginationBase(MediaEntity) {}
