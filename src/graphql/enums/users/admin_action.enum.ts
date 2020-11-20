import { registerEnumType } from '@nestjs/graphql';

export enum UserAdminActionEnum {
  DELETE = 'DELETE',
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
}

registerEnumType(UserAdminActionEnum, {
  name: 'UserAdminActionEnum',
});
