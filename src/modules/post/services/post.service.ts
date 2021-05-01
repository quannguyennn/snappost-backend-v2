import { Injectable } from '@nestjs/common';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { FollowService } from 'src/modules/follow/services/follow.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { DeepPartial, In, Not } from 'typeorm';
import { CreatePostInput } from '../dtos/create_post.input';
import { Post, PostConnection } from '../entities/post.entity';
import { PostRepository } from '../repositories/post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly followService: FollowService,
    private readonly userService: UsersService,
  ) { }

  find = async (): Promise<Post[]> => {
    return await this.postRepository.find();
  };

  findById = async (id: number) => {
    return await this.postRepository.findOne(id);
  };

  create = async (creatorId: number, input: CreatePostInput): Promise<Post> => {
    const newPost = this.postRepository.create({ creatorId, ...input });
    return await this.postRepository.save(newPost);
  };

  update = async (input: DeepPartial<Post>): Promise<Post> => {
    await this.postRepository.update(input.id ?? 0, input);
    return this.postRepository.findOneOrFail(input.id);
  };

  remove = async (id: number): Promise<boolean> => {
    await this.postRepository.delete(id);
    return true;
  };

  getListPost = async (userId: number, page?: number, limit?: number): Promise<PostConnection> => {
    page = page || 1;
    limit = limit || 15;
    const listUserFollow = await this.followService.getFollowerUserId(userId);
    const [data, total] = await this.postRepository
      .createQueryBuilder('post')
      .where('post.creatorId IN (:...user)', { user: [...listUserFollow, userId] })
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('post.score', 'DESC')
      .getManyAndCount();
    return createPaginationObject(data, total, page, limit);
  };

  getExplorePost = async (limit: number, page: number, blocked: number[], userId: number) => {
    const userBlockMe = await this.userService.getPeopleBlockUserId(userId);
    const blacklist = [...blocked, ...userBlockMe];
    const [items, total] = await this.postRepository.findAndCount({
      where: blacklist.length
        ? {
          creatorId: Not(In(blacklist)),
          isPublic: true
        }
        : { isPublic: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return createPaginationObject(items, total, page, limit);
  };

  getPostByUserId = async (creatorId: number, limit: number, page: number): Promise<PostConnection> => {
    const [items, total] = await this.postRepository.findAndCount({
      where: { creatorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return createPaginationObject(items, total, page, limit);
  };

  async pagination({ page, limit }: { page?: number; limit?: number }) {
    return this.postRepository.paginate({ page, limit });
  }

  updateScore = async ({ postId, value }: { value: number, postId?: number }) => {
    if (postId) {
      await this.postRepository.increment({ id: postId }, "score", value)
    } else {
      await this.postRepository.increment({}, "score", value)
    }
  }
}
