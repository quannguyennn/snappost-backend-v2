import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/users.repository';
import { User } from './entities/users.entity';
import { UserDataLoader } from './dataloaders/users.dataloader';
import { UniqueEmail } from '../auth/validators/valid_email';
import { UsersMutationResolver } from './resolvers/users_mutation.resolver';
import { UsersQueryResolver } from './resolvers/users_query.resolver';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRepository]), forwardRef(() => MediaModule)],
  providers: [UserDataLoader, UsersService, UsersQueryResolver, UsersMutationResolver, UniqueEmail],
  exports: [UsersService, UserDataLoader],
})
export class UsersModule {}
