import { User } from '../users/entities/users.entity';

export type AuthModuleOptions = {
  secret?: string;
};
export type Payload = Pick<User, 'id' | 'nickname' | 'email'>;

export type JWTDecodeValue = {
  iat: number;
  exp: number;
  iss?: string;
  aud?: string | string[];
} & Payload;
