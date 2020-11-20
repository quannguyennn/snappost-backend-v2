import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthTokenEntity } from './modules/auth/entities/auth.entity';
import { MediaEntity } from './modules/media/entities/media.entity';
import { User } from './modules/users/entities/users.entity';
import { Sample } from './sample/entities/sample.entity';
import { Otp } from './modules/auth/entities/opt.entity';
export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.DATABASE_SYNC === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  entities: [User, MediaEntity, AuthTokenEntity, Sample, Otp],
};
