import { Injectable } from '@nestjs/common';
import { createPaginationObject } from 'src/modules/common/common.repository';
import { FollowService } from 'src/modules/follow/services/follow.service';
import { In } from 'typeorm';
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

  getListPost = async (userId: number, page?: number, limit?: number): Promise<PostConnection> => {
    page = page || 1;
    limit = limit || 15;
    const listUserFollow = await this.followService.getListUserFollow(userId);
    const [data, total] = await this.postRepository.findAndCount({
      where: {
        creatorId: In([
          ...listUserFollow.map((user) => {
            return user.followUser;
          }),
          userId,
        ]),
      },
      skip: limit * (page - 1),
      take: limit,
    });
    return createPaginationObject(data, total, page, limit);
  };

  async pagination({ page, limit }: { page?: number; limit?: number }) {
    return this.postRepository.paginate({ page, limit });
  }
}
