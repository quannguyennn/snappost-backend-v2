import { registerEnumType } from '@nestjs/graphql';

export enum PubsubEventEnum {
  onCreateComment = 'onCreateComment',
  onDeleteComment = 'onDeleteComment',
  onLikePost = 'onLikePost',
  onUnLikePost = 'onUnLikePost',
}

registerEnumType(PubsubEventEnum, {
  name: 'PubsubEventEnum',
});
