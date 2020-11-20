import { Column, CreateDateColumn, Entity, UpdateDateColumn, DeepPartial } from 'typeorm';
import { snowflake } from 'src/helpers/common';
@Entity({
  name: 'otp',
})
export class Otp {
  @Column('bigint', {
    primary: true,
    unsigned: true,
  })
  id: string;

  @Column()
  phone: string;

  @Column()
  code: string;

  @Column({ default: false })
  isValid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  constructor(partial: DeepPartial<Otp>) {
    Object.assign(this, { id: snowflake.nextId(), ...partial });
  }
}
