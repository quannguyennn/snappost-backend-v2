import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { GqlCookieAuthGuard } from 'src/guards/gql-auth.guard';
import { AuthCookie, CurrentUser } from 'src/decorators/common.decorator';
import { User } from 'src/modules/users/entities/users.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { AuthConnection } from '../entities/auth_connection.entity';
import jwtDecode from 'jwt-decode';
import moment from 'moment';
import type { JWTDecodeValue } from '../auth.interface';
import { GraphQLContext } from 'src/graphql/app.graphql-context';
import { UserRegister } from '../dto/user_register.dto';
import { LoginSNSInput } from '../dto/login_sns_input.dto';
import { LoginEmailInput } from '../dto/login_email.input.dto';
import { AppRoles } from 'src/graphql/enums/roles.type';
import { ChangePasswordInput, ChangePasswordTokenInput } from '../dto/change_password.dto';
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, private readonly userService: UsersService) {}

  @Mutation(() => AuthConnection)
  async login(@Args('input') input: LoginEmailInput, @Context() ctx: GraphQLContext) {
    const { email, password } = input;
    const data = await this.authService.login(email, password);
    ctx.res.cookie('token', data.accessToken, {
      expires: moment(jwtDecode<JWTDecodeValue>(data.accessToken).exp * 1000).toDate(),
      sameSite: false,
      httpOnly: true,
    });
    ctx.res.cookie('refreshToken', data.refreshToken, {
      expires: moment(jwtDecode<JWTDecodeValue>(data.refreshToken).exp * 1000).toDate(),
      sameSite: false,
      httpOnly: true,
    });
    return data;
  }

  @Mutation(() => User)
  async register(@Args('user') user: UserRegister): Promise<User> {
    return await this.authService.register(user);
  }

  @Mutation(() => AuthConnection)
  async loginWithSNS(@Args('input') input: LoginSNSInput, @Context() ctx: GraphQLContext) {
    const data = await this.authService.loginWithSNS(input);
    if (data.accessToken && data.refreshToken) {
      ctx.res.cookie('token', data.accessToken, {
        expires: moment(jwtDecode<JWTDecodeValue>(data.accessToken).exp * 1000).toDate(),
        sameSite: false,
        httpOnly: true,
      });
      ctx.res.cookie('refreshToken', data.refreshToken, {
        expires: moment(jwtDecode<JWTDecodeValue>(data.refreshToken).exp * 1000).toDate(),
        sameSite: false,
        httpOnly: true,
      });
    }
    return data;
  }

  @Query(() => String)
  async getPayToken(@Args('state') state: string, @Args('code') code: string): Promise<string> {
    return await this.authService.getPaycoToken(state, code);
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args('email') email: string): Promise<boolean> {
    return await this.authService.sendResetPasswordMail(email);
  }

  @Mutation(() => Boolean)
  async sendOTP(@Args('phone') phone: string): Promise<boolean> {
    return await this.authService.sendOTPCode(phone);
  }

  @Mutation(() => Boolean)
  async validateOTP(@Args('phone') phone: string, @Args('code') code: string): Promise<boolean> {
    return await this.authService.validateOTPCode(phone, code);
  }

  @Mutation(() => User)
  findEmailByPhone(
    @Args('name') name: string,
    @Args('phone') phone: string,
    @Args('code') code: string,
  ): Promise<User | undefined> {
    return this.authService.findEmailByPhone(name, phone, code);
  }

  @Mutation(() => String)
  requestChangePassword(
    @Args('name') name: string,
    @Args('phone') phone: string,
    @Args('email') email: string,
    @Args('code') code: string,
  ): Promise<string | undefined> {
    return this.authService.requestChangePassword(name, phone, code, email);
  }

  @Mutation(() => Boolean)
  changePassword(@Args('input') input: ChangePasswordTokenInput): Promise<boolean | undefined> {
    return this.authService.changePasswordToken(input.password, input.token);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => Boolean)
  updatePassword(@CurrentUser() user: User, @Args('input') input: ChangePasswordInput): Promise<boolean | undefined> {
    return this.authService.changePassword(user, input);
  }

  @UseGuards(GqlCookieAuthGuard)
  @Mutation(() => User)
  async setRole(@CurrentUser() user, @Args('role') role: AppRoles): Promise<User | undefined> {
    return await this.authService.setRole(user.id, role);
  }

  @AuthCookie()
  @Mutation(() => Boolean, { name: 'logout' })
  async logout(@CurrentUser() user: User, @Context() ctx: GraphQLContext) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const token: string = ctx.req.cookies.token;
      const userId = user.id;
      ctx.res.clearCookie('token');
      ctx.res.clearCookie('refreshToken');
      await this.authService.deleteToken(token, userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}
