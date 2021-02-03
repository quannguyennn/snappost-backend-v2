import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field()
  content: string;

  @Field()
  parentId?: string;

  @Field()
  postId: string;
}

@InputType()
export class UpdateCommentInput extends CreateCommentInput {
  @Field()
  id: string;
}

@InputType()
export class DeleteCommentInput {
  @Field()
  id: string;
}
