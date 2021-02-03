import { Injectable } from '@nestjs/common';
import { CreatePostInput, UpdatePostInput } from '../dtos/create_post.input';
import { Post } from '../entities/post.entity';
import { PostRepository } from '../repositories/post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  find = async (): Promise<Post[]> => {
    return await this.postRepository.find();
  };
  create = async (creatorId: string, input: CreatePostInput): Promise<Post> => {
    const newPost = this.postRepository.create({ creatorId, ...input });
    return await this.postRepository.save(newPost);
  };

  update = async (input: UpdatePostInput): Promise<Post> => {
    await this.postRepository.update(input.id, input);
    return this.postRepository.findOneOrFail(input.id);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.postRepository.delete(id);
    return true;
  };

  async pagination({ page, limit }: { page?: number; limit?: number }) {
    return this.postRepository.paginate({ page, limit });
  }
}
