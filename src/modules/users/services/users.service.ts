/* eslint-disable security/detect-object-injection */
import { Injectable } from '@nestjs/common';
import { DeepPartial, getManager, getRepository } from 'typeorm';
import { UserRepository } from '../repositories/users.repository';
import { AppRoles, User, UserConnection } from '../entities/users.entity';
import bcrypt from 'bcryptjs';
import { errorName } from 'src/errors';
import { HandlebarsAdapter } from 'src/modules/template/adapters/handlebars';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { UserActiveEnum } from 'src/graphql/enums/users/user_active.enum';
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository, private readonly handlebarsAdapter: HandlebarsAdapter) {}

  create = (data: DeepPartial<User>) => {
    try {
      const user = this.userRepository.create(data);
      return this.userRepository.save(user);
    } catch (error) {
      throw new Error(errorName.SERVER_ERROR);
    }
  };

  update = async (userId: number, data: DeepPartial<User>): Promise<User | undefined> => {
    await this.userRepository.update(userId, data);
    return this.userRepository.findOneOrFail(userId);
  };

  findById = async (id: number): Promise<User | undefined> => {
    return this.userRepository.findOne({ where: { id } });
  };

  countByNickname = (nickname: string): Promise<number> => {
    return this.userRepository.createQueryBuilder("user").where("user.nickname LIKE :nickname", {nickname: `${nickname}%`}).getCount()
  };
  findByPhone = (phone: string): Promise<User | undefined> => {
    return this.userRepository.findOne({ where: { phone } });
  };

  find = (data: DeepPartial<User>): Promise<User | undefined> => {
    return this.userRepository.findOne(data);
  };

  findWhere = (data): Promise<User | undefined> => {
    return this.userRepository.findOne(data);
  };

  pagination = async (
    limit: number,
    page: number,
    keyword?: string,
    roles?: AppRoles,
    startDate?: string,
    endDate?: string,
    active?: UserActiveEnum,
  ): Promise<UserConnection> => {
    let items, total;
    page = page || 1;
    limit = limit || 20;
    keyword = keyword?.trim() || '';

    if (active !== UserActiveEnum.ALL) {
      [items, total] = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.roles IN (:...role)', {
          role: roles === AppRoles.ALL ? ['OWNER', 'LAUNDRY', 'DELIVERY', 'USER'] : [roles],
        })
        .andWhere(
          `(LOWER(user.name) LIKE LOWER('%${keyword}%') OR LOWER(user.email) LIKE LOWER('%${keyword}%') OR user.phone LIKE LOWER('%${keyword}%'))`,
        )
        .andWhere('user.createdAt <= :endDate', { endDate })
        .andWhere('user.createdAt > :startDate', { startDate })
        .andWhere('user.isActive = :isActive', { isActive: active === UserActiveEnum.ACTIVE ? true : false })
        .limit(limit)
        .offset(limit * (page - 1))
        .orderBy('user.createdAt', 'DESC')
        .getManyAndCount();
    } else {
      [items, total] = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.roles IN (:...role)', {
          role: roles === 'ALL' ? ['OWNER', 'LAUNDRY', 'DELIVERY', 'USER'] : [roles],
        })
        .andWhere('user.createdAt <= :endDate', { endDate })
        .andWhere('user.createdAt > :startDate', { startDate })
        .andWhere(
          `(LOWER(user.name) LIKE LOWER('%${keyword}%') OR LOWER(user.email) LIKE LOWER('%${keyword}%') OR user.phone LIKE LOWER('%${keyword}%'))`,
        )
        .take(limit)
        .skip(limit * (page - 1))
        .orderBy('user.createdAt', 'DESC')
        .getManyAndCount();
    }

    return createPaginationObject(items, total, page, limit);
  };

  login = async (email: string) => {
    const user = await getManager()
      .createQueryBuilder(User, 'user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();

    if (!user) throw new Error(errorName.INVALID_EMAIL_PASSWORD);
    return user;
  };
}
