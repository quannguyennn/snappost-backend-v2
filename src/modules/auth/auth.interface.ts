import { User } from '../users/entities/users.entity';

export type AuthModuleOptions = {
  secret?: string;
};
export type Payload = Pick<User, 'id' | 'name' | 'email' | 'isActive' | 'roles'>;

export type JWTDecodeValue = {
  iat: number;
  exp: number;
  iss?: string;
  aud?: string | string[];
} & Payload;
