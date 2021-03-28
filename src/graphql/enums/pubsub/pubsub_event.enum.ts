import { registerEnumType } from '@nestjs/graphql';

export enum PubsubEventEnum {
  onCreateComment = 'onCreateComment',
  onDeleteComment = 'onDeleteComment',
  onLikePost = 'onLikePost',
  onUnLikePost = 'onUnLikePost',
  onNewNotification = 'onNewNotification',
  onNewMessage = 'onNewMessage',
  onSeenMessage = "onSeenMessage",
  onReceiveMessage = "onReceiveMessage"
}

registerEnumType(PubsubEventEnum, {
  name: 'PubsubEventEnum',
});
