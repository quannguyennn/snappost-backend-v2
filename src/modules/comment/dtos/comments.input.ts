import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field()
  content: string;

  @Field({ defaultValue: 0 })
  parentId?: number;

  @Field()
  postId: string;
}

@InputType()
export class UpdateCommentInput extends CreateCommentInput {
  @Field()
  id: number;
}

@InputType()
export class DeleteCommentInput {
  @Field()
  id: string;
}
