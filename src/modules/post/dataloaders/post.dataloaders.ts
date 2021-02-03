import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { Post } from '../entities/post.entity';
import { PostRepository } from '../repositories/post.repository';

@Injectable({ scope: Scope.REQUEST })
export class PostDataloader extends DataLoader<string, Post> {
  constructor(private readonly postRepository: PostRepository) {
    super(async (ids: ReadonlyArray<string>) => {
      const rows = await this.postRepository.findByIds([...ids]);
      return ids.map((id) => rows.find((x) => x.id == id) || new Error('Not found'));
    });
  }
}
