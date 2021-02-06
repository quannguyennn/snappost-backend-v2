/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/services/users.service';
import { User } from 'src/modules/users/entities/users.entity';
import type { Payload, JWTDecodeValue } from '../auth.interface';
import { AuthRepository } from '../repositories/auth.repository';
import { ApolloError } from 'apollo-server';
import jwtDecode from 'jwt-decode';
import { AuthTokenEntity } from '../entities/auth.entity';
import { DeepPartial, DeleteResult, FindConditions } from 'typeorm';
import { snowflake } from 'src/helpers/common';
import { UserRegister } from '../dto/user_register.dto';
import { LoginSNSInput } from '../dto/login_sns_input.dto';
import { SNSTypeEnum } from 'src/graphql/enums/sns_type';
import axios from 'axios';
import { errorName } from 'src/errors';
import { HandlebarsAdapter } from 'src/modules/template/adapters/handlebars';
import { createEmailParam, sendEmail } from 'src/helpers/ses';
import { AppRoles } from 'src/graphql/enums/roles.type';
import { OtpRepository } from '../repositories/otp.repository';
import { getConnection } from 'typeorm';
import { Otp } from '../entities/opt.entity';
import { sendSMS } from 'src/helpers/sendSMS';
import bcrypt from 'bcryptjs';
import {
  GOOGLE_DOMAIN,
  KAKAO_DOMAIN,
  NAVER_DOMAIN,
  PAYCO_DOMAIN,
  PAYCO_CLIENT_ID,
  PAYCO_TOKEN_DOMAIN,
  PAYCO_SECRET_KEY,
} from '../auth.constants';
import { ChangePasswordInput } from '../dto/change_password.dto';
type JwtGenerateOption = {
  audience?: string | string[];
  issuer?: string;
  jwtid?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly handlebarsAdapter: HandlebarsAdapter,
    private readonly optRepository: OtpRepository,
  ) {}

  findOne = async (conditions?: FindConditions<AuthTokenEntity>) => {
    return await this.authRepository.findOne(conditions);
  };

  validateUser = async (email: string): Promise<Omit<User, 'password' | 'passwordSalt'> | undefined> => {
    const user = await this.usersService.login(email);
    if (user) {
      const { ...result } = user;
      return result;
    } else {
      throw new Error(errorName.USER_NOT_EXIST);
    }
  };

  login = async (email: string) => {
    const user = await this.validateUser(email);
    if (!user) {
      throw new Error(errorName.USER_NOT_EXIST);
    }
    try {
      const authToken = await this.saveAuthToken(user, {
        issuer: 'snappost',
        audience: ['app'],
      });
      if (!authToken) {
        throw new ApolloError('Error');
      }
      return {
        user,
        accessToken: authToken?.accessToken,
        refreshToken: authToken?.refreshToken,
      };
    } catch (err) {
      throw new ApolloError('Error');
    }
  };

  initAccessToken = (data: { payload: Payload; options?: JwtGenerateOption }) => {
    const { payload, options } = data;
    return {
      accessToken: this.jwtService.sign(payload, {
        ...options,
        expiresIn: `30 days`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        ...options,
        expiresIn: `35 days`,
      }),
    };
  };

  initChangePassToken = (payload) => {
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `10 m`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `10 m`,
      }),
    };
  };

  saveAuthToken = async (userInfo: Pick<User, 'id' | 'nickname' | 'email'>, options?: JwtGenerateOption) => {
    const { accessToken, refreshToken } = this.initAccessToken({
      payload: userInfo,
      options,
    });

    return await this.createToken({
      userId: userInfo?.id,
      accessToken,
      refreshToken,
    });
  };

  createToken = async (data: DeepPartial<AuthTokenEntity>) => {
    const authToken = this.authRepository.create({ id: snowflake.nextId(), ...data });
    const newAuthToken = await this.authRepository.save(authToken);
    return await this.authRepository.findOne(newAuthToken.id);
  };

  refreshToken = async (refreshToken: string) => {
    try {
      const currentPayload: Payload = await this.jwtService.verifyAsync(refreshToken, {
        ignoreExpiration: false,
      });
      const token = await this.authRepository.findOne({ where: { refreshToken } });
      if (!token) {
        throw new ApolloError('invalid_token');
      }
      const decoded = jwtDecode<JWTDecodeValue>(token.accessToken);
      const decodedRefreshToken = jwtDecode<JWTDecodeValue>(token.refreshToken);
      const payload: Payload = currentPayload;
      const refreshPayload: Payload = currentPayload;
      token.accessToken = this.jwtService.sign(payload, {
        expiresIn: `30 days`,
        issuer: decoded.iss,
        audience: decoded.aud,
      });
      token.refreshToken = this.jwtService.sign(refreshPayload, {
        expiresIn: `35 days`,
        issuer: decodedRefreshToken.iss,
        audience: decodedRefreshToken.aud,
      });
      const newToken = await this.updateToken(token);
      const user = this.usersService.findByEmail(currentPayload?.email || '');
      if (newToken) {
        return {
          user,
          accessToken: newToken.accessToken,
          refreshToken: newToken.refreshToken,
        };
      }
    } catch (error) {
      throw new ApolloError('invalid_token');
    }
  };

  updateToken = async (data: Partial<AuthTokenEntity>) => {
    if (data.id) {
      delete data.updatedAt;
      await this.authRepository.update(data.id, data);
      return await this.authRepository.findOne(data.id);
    }
  };

  register = async (userRegister: UserRegister): Promise<User> => {
    if (userRegister.snsToken) {
      const uSocial = await this.getUserSNSToken(userRegister.snsToken, userRegister.snsType);
      if (userRegister.snsType === SNSTypeEnum.GOOGLE) {
        userRegister.googleId = uSocial?.id;
      }
    }
    const user = await this.usersService.create(userRegister);

    return user;
  };

  getUserSNSToken = async (snsToken: string, snsType: SNSTypeEnum) => {
    try {
      let response;
      if (snsType === SNSTypeEnum.GOOGLE) {
        response = await axios.get(GOOGLE_DOMAIN, {
          params: {
            access_token: snsToken,
          },
        });
      }

      if (response.status === 200) {
        if (snsType === SNSTypeEnum.GOOGLE) {
          return {
            name: response?.data?.name,
            email: response?.data?.email,
            id: response?.data?.sub,
            isActive: false,
            isSocial: true,
          };
        }
      } else {
        throw new Error(errorName.INVALID_SNS_TOKEN);
      }
    } catch (error) {
      throw new Error(errorName.INVALID_SNS_TOKEN);
    }
  };
  getPaycoToken = async (state?: string, code?: string): Promise<string> => {
    let response;
    try {
      response = await axios.get(PAYCO_TOKEN_DOMAIN, {
        params: {
          grant_type: 'authorization_code',
          client_id: PAYCO_CLIENT_ID,
          client_secret: PAYCO_SECRET_KEY,
          state: state,
          code: code,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (response.data?.access_token) return response.data?.access_token;
      throw new Error(errorName.INVALID_SNS_TOKEN);
    } catch (e) {
      throw new Error(errorName.INVALID_SNS_TOKEN);
    }
  };
  loginWithSNS = async (input: LoginSNSInput) => {
    const uSocial = await this.getUserSNSToken(input.snsToken, input.snsType);
    let con;
    if (input.snsType === SNSTypeEnum.GOOGLE) {
      con = { googleId: uSocial?.id };
    }
    const user = await this.usersService.findWhere({
      where: con,
    });
    if (!user) {
      return {
        user: new User({ ...uSocial, createdAt: new Date(), updatedAt: new Date() }),
      };
    }
    const { password, passwordSalt, ...result } = user;
    try {
      const authToken = await this.saveAuthToken(result, {
        issuer: 'snappost',
        audience: ['app'],
      });
      if (!authToken) {
        throw new ApolloError('Error');
      }
      return {
        user,
        accessToken: authToken?.accessToken,
        refreshToken: authToken?.refreshToken,
      };
    } catch (err) {
      throw new ApolloError('Error');
    }
  };

  // sendOTPCode = async (phone: string): Promise<boolean> => {
  //   const oldOtp = await this.optRepository.find({ phone: phone });
  //   if (oldOtp) {
  //     await this.optRepository.remove(oldOtp);
  //   }
  //   const code = this.randomInteger(1000, 9999).toString();
  //   const sent = await sendSMS(`본인인증 번호는 ${code} 입니다. 정확히 입력해주세요.`, phone);
  //   if (sent) {
  //     const otp = this.optRepository.create({ phone: phone, code: code });
  //     await this.optRepository.save(otp);
  //     return true;
  //   }
  //   return false;
  // };

  // validateOTPCode = async (phone: string, code: string): Promise<boolean> => {
  //   await getConnection()
  //     .createQueryBuilder()
  //     .delete()
  //     .from(Otp)
  //     .where('createdAt <= :time', { time: new Date(new Date().getTime() - 600000) })
  //     .execute();

  //   const otp = await this.optRepository.findOne({
  //     where: {
  //       phone,
  //       code,
  //     },
  //   });
  //   if (otp) {
  //     // await this.optRepository.delete(otp.id);
  //     // await this.optRepository.update(otp.id, { isValid: true });
  //     return true;
  //   }
  //   throw new Error(errorName.INVALID_OTP);
  // };

  // removeOtp = (code: string) => {
  //   return this.optRepository.delete({ code });
  // };

  changePassword = async (user: User, input: ChangePasswordInput): Promise<boolean | undefined> => {
    const check = bcrypt.compareSync(input.old_password, user.password);
    if (check) {
      await this.usersService.update(user.id, { password: input.new_password });
      return true;
    } else {
      throw new Error(errorName.INVALID_OLD_PASSWORD);
    }
  };

  // randomInteger = (min, max): string => {
  //   // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  //   return `${Math.floor(Math.random() * (max - min + 1)) + min}`;
  // };

  deleteToken = (token: string, userId: number): Promise<DeleteResult> => {
    return this.authRepository.delete({ accessToken: token, userId });
  };
}
