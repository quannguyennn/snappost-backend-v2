import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field(() => [String], { nullable: true, defaultValue: [] })
  medias?: string[];

  @Field()
  caption: string;
}

@InputType()
export class UpdatePostInput extends CreatePostInput {
  @Field()
  id: string;
}
