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
import { ApolloError } from 'apollo-server';
import { FollowService } from 'src/modules/follow/services/follow.service';
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository, private readonly followService: FollowService) {}

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
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.nickname LIKE :nickname', { nickname: `${nickname}%` })
      .getCount();
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

  searchUser = async (
    userId: number,
    keyword: string,
    isRestriced: boolean,
    limit: number,
    page: number,
  ): Promise<UserConnection> => {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .where('(user.name ILIKE :name OR user.nickname ILIKE :nickname)', {
          name: `%${keyword}%`,
          nickname: `%${keyword}%`,
        });
      if (isRestriced) {
        const followingUser = await this.followService.getFollowingUserId(userId);
        query.andWhere('user.id IN (:...userIds)', { userIds: followingUser });
      }
      const [items, total] = await query
        .limit(limit)
        .offset((page - 1) * limit)
        .getManyAndCount();
      return createPaginationObject(items, total, limit, page);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  };

  isAvailable = async (nickname: string) => {
    try {
      const user = await this.userRepository.findOne({ nickname });
      return user ? false : true;
    } catch (error) {
      throw new Error(error.message);
    }
  };
}
