import { registerEnumType } from '@nestjs/graphql';

export enum SNSTypeEnum {
  GOOGLE,
}
registerEnumType(SNSTypeEnum, {
  name: 'SNSTypeEnum',
});
