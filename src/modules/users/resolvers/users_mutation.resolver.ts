import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { UsersService } from '../services/users.service';
import { User } from '../entities/users.entity';
import { UseGuards } from '@nestjs/common';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CurrentUser } from 'src/decorators/common.decorator';
import { UpdateUserInput } from '../dto/new_user.input';
@Resolver(() => User)
export class UsersMutationResolver {
  constructor(private readonly userService: UsersService) {}

  // @Mutation(() => User)
  // createUser(@Args('input') input: UserRegister) {
  //   return this.userService.create(input);
  // }
  @UseGuards(GqlCookieAuthGuard, RolesGuard)
  @Mutation(() => User)
  async updateUserInfo(@CurrentUser() user: User, @Args('input') input: UpdateUserInput): Promise<User | undefined> {
    return await this.userService.update(user.id, input);
  }
}
