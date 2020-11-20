import { registerEnumType } from '@nestjs/graphql';

export enum UserActiveEnum {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  NOT_ACTIVE = 'NOT_ACTIVE',
}

registerEnumType(UserActiveEnum, {
  name: 'UserActiveEnum',
});
