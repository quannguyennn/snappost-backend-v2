import { Injectable } from '@nestjs/common';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { FollowService } from 'src/modules/follow/services/follow.service';
import { In, Not } from 'typeorm';
import { CreatePostInput, UpdatePostInput } from '../dtos/create_post.input';
import { Post, PostConnection } from '../entities/post.entity';
import { PostRepository } from '../repositories/post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository, private readonly followService: FollowService) { }

  find = async (): Promise<Post[]> => {
    return await this.postRepository.find();
  };

  create = async (creatorId: number, input: CreatePostInput): Promise<Post> => {
    const newPost = this.postRepository.create({ creatorId, ...input });
    return await this.postRepository.save(newPost);
  };

  update = async (input: UpdatePostInput): Promise<Post> => {
    await this.postRepository.update(input.id, input);
    return this.postRepository.findOneOrFail(input.id);
  };

  remove = async (id: number): Promise<boolean> => {
    await this.postRepository.delete(id);
    return true;
  };

  getListPost = async (userId: number, page?: number, limit?: number, blocked?: number[]): Promise<PostConnection> => {
    page = page || 1;
    limit = limit || 15;
    const listUserFollow = await this.followService.getFollowerUserId(userId);

    const [data, total] = await this.postRepository.createQueryBuilder("post")
      .where("post.creatorId IN (:...user)", { user: [...listUserFollow, userId] })
      .andWhere(blocked?.length ? "post.creatorId NOT IN (:...blocked)" : "1=1", { blocked })
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy("post.createdAt", "DESC")
      .getManyAndCount()
    return createPaginationObject(data, total, page, limit);
  };

  getExplorePost = async (limit: number, page: number, blocked: number[]) => {
    const [items, total] = await this.postRepository.findAndCount({
      where: blocked.length ? {
        creatorId: Not(In(blocked))
      } : {},
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
}
