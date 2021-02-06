import { Entity, Column, DeepPartial, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, HideField } from '@nestjs/graphql';
import { Node, PaginationBase } from 'src/graphql/types/common.interface.entity';
import { snowflake } from 'src/helpers/common';

export enum AppRoles {
  ALL = 'ALL',
  ADMIN = 'ADMIN',
  USER = 'USER',
  OWNER = 'OWNER',
}

@ObjectType({
  implements: [Node],
})
@Entity({
  name: 'users',
})
export class User implements Node {
  @PrimaryGeneratedColumn()
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: number;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 50, unique: true, nullable: true })
  email: string;

  @HideField()
  @Column({ type: 'text' })
  password: string;

  @HideField()
  @Column({ name: 'passwordSalt' })
  passwordSalt: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Column({ unique: true, nullable: true })
  naverId?: string;

  @Column({ nullable: true })
  avatar?: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;

  isSocial?: boolean;
  snsId?: string;

  constructor(partial: DeepPartial<User>) {
    Object.assign(this, { id: snowflake.nextId(), ...partial });
  }
}

@ObjectType()
export class UserConnection extends PaginationBase(User) {}

@ObjectType()
export class FrequentUser extends User {
  @Field({ defaultValue: 0, nullable: true })
  totalOrder?: number;
}
