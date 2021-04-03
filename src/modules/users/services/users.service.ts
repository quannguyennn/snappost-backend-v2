/* eslint-disable security/detect-object-injection */
import { Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { UserRepository } from '../repositories/users.repository';
import { User, UserConnection } from '../entities/users.entity';
import { errorName } from 'src/errors';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { ApolloError } from 'apollo-server';
import { FollowService } from 'src/modules/follow/services/follow.service';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository, private readonly followService: FollowService) { }

  create = (data: DeepPartial<User>) => {
    try {
      const user = this.userRepository.create(data);
      return this.userRepository.save(user);
    } catch (error) {
      throw new Error(errorName.SERVER_ERROR);
    }
  };

  update = async (userId: number, data: DeepPartial<User>): Promise<User | undefined> => {
    await this.userRepository.update(userId, { ...data });
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
      const blockUser = await this.getPeopleBlockUserId(userId);
      const query = this.userRepository
        .createQueryBuilder('user')
        .where('(user.name ILIKE :name OR user.nickname ILIKE :nickname)', {
          name: `%${keyword}%`,
          nickname: `%${keyword}%`,
        });
      if (blockUser.length)
        query.andWhere('user.id NOT IN (:...blockedUser)', { blockedUser: await this.getPeopleBlockUserId(userId) });

      if (isRestriced) {
        const followingUser = await this.followService.getFollowingUserId(userId);
        if (followingUser.length) {
          query.andWhere('user.id IN (:...userIds)', { userIds: followingUser });
        }
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

  blockUser = async (userId: number, blockerId: number) => {
    try {
      const blockerInfo = await this.userRepository.findOne(blockerId);
      if (!blockerInfo) throw new Error('Not found');
      if (!blockerInfo.blocked.includes(userId)) {
        blockerInfo.blocked.push(userId);
        await this.userRepository.update({ id: blockerId }, { ...blockerInfo });
        await this.followService.unFollowUser(userId, blockerId);
        await this.followService.unFollowUser(blockerId, userId);
      }
      return blockerInfo;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  unBlockUser = async (userId: number, blockerId: number) => {
    try {
      const blockerInfo = await this.userRepository.findOne(blockerId);
      if (!blockerInfo) throw new Error('Not found');
      const temp = blockerInfo.blocked.filter((item) => Number(item) !== userId);
      await this.userRepository.update({ id: blockerId }, { ...blockerInfo, blocked: temp });
      return blockerInfo;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getPeopleBlockUserId = async (userId: number) => {
    const blockUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.blocked && ARRAY[:...userId]', { userId: [userId] })
      .getMany();

    return blockUser.map((item) => item.id);
  };

  getAllUser = async (limit: number, page: number): Promise<UserConnection> => {
    const [items, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return createPaginationObject(items, total, page, limit);
  };
}
