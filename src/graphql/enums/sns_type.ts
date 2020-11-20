import { registerEnumType } from '@nestjs/graphql';

export enum SNSTypeEnum {
  GOOGLE,
  KAKAO,
  NAVER,
  PAYCO,
}
registerEnumType(SNSTypeEnum, {
  name: 'SNSTypeEnum',
});
