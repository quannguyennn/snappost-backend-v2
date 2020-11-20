import { Entity, Column, DeepPartial, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, HideField, ID } from '@nestjs/graphql';
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
  @Field(() => ID)
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true, nullable: true })
  email: string;

  @HideField()
  @Column({ type: 'text' })
  password: string;

  @HideField()
  @Column({ name: 'passwordSalt' })
  passwordSalt: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ unique: true, nullable: true })
  paycoId?: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Column({ unique: true, nullable: true })
  kakaoId?: string;

  @Column({ unique: true, nullable: true })
  naverId?: string;

  @Column({
    default: true,
    name: 'isActive',
  })
  isActive: boolean;

  @Column({
    nullable: true,
    type: 'text',
    enum: AppRoles,
  })
  // @Column({ length: 50, nullable: true })
  roles?: string;

  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;

  isSocial?: boolean;
  snsId?: string;
  // @OneToMany((type) => UserLaundry, (userLaundry) => userLaundry.user)
  // userLaundry: UserLaundry[];

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
