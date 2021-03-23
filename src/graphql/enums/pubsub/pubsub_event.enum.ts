import { registerEnumType } from '@nestjs/graphql';

export enum PubsubEventEnum {
  onCreateComment = 'onCreateComment',
  onDeleteComment = 'onDeleteComment',
  onLikePost = 'onLikePost',
  onUnLikePost = 'onUnLikePost',
  onNewNotification = 'onNewNotification',
}

registerEnumType(PubsubEventEnum, {
  name: 'PubsubEventEnum',
});
