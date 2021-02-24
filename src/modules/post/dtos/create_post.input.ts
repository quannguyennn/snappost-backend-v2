import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field(() => [Number], { nullable: true, defaultValue: [] })
  medias?: number[];

  @Field()
  caption: string;
}

@InputType()
export class UpdatePostInput extends CreatePostInput {
  @Field()
  id: number;
}
