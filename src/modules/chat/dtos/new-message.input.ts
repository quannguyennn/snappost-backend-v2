import { Field, InputType } from '@nestjs/graphql';
import { MediaType } from 'src/graphql/enums/chat/media-type.enum';

@InputType()
export class NewMessageInput {
  @Field()
  content: string;

  @Field()
  chatId: number;

  @Field({ nullable: true })
  media?: string;

  @Field(() => MediaType, { nullable: true })
  mediaType?: MediaType;
}
