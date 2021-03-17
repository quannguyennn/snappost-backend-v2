import { registerEnumType } from '@nestjs/graphql';

export enum PubsubEventEnum {
  onCreateComment = 'onCreateComment',
}

registerEnumType(PubsubEventEnum, {
  name: 'PubsubEventEnum',
});
