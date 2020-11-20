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

  validateUser = async (email: string, pass: string): Promise<Omit<User, 'password' | 'passwordSalt'> | undefined> => {
    const user = await this.usersService.login(email, pass);
    if (user) {
      const { password, passwordSalt, ...result } = user;
      return result;
    } else {
      throw new Error(errorName.USER_NOT_EXIST);
    }
  };

  login = async (email: string, password: string) => {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new Error(errorName.USER_NOT_EXIST);
    }
    if (!user.isActive) throw new Error(errorName.USER_DEACTIVE);
    try {
      const authToken = await this.saveAuthToken(user, {
        issuer: 'klc',
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

  saveAuthToken = async (
    userInfo: Pick<User, 'id' | 'name' | 'email' | 'isActive' | 'roles'>,
    options?: JwtGenerateOption,
  ) => {
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
      if (userRegister.snsType === SNSTypeEnum.KAKAO) {
        userRegister.kakaoId = uSocial?.id;
      }
      if (userRegister.snsType === SNSTypeEnum.NAVER) {
        userRegister.naverId = uSocial?.id;
      }
      if (userRegister.snsType === SNSTypeEnum.PAYCO) {
        userRegister.paycoId = uSocial?.id;
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
      if (snsType === SNSTypeEnum.KAKAO) {
        response = await axios.get(KAKAO_DOMAIN, {
          headers: {
            Authorization: 'Bearer ' + snsToken,
          },
        });
      }
      if (snsType === SNSTypeEnum.NAVER) {
        response = await axios.get(NAVER_DOMAIN, {
          headers: {
            Authorization: 'Bearer ' + snsToken,
          },
        });
      }
      if (snsType === SNSTypeEnum.PAYCO) {
        response = await axios.post(
          PAYCO_DOMAIN,
          {},
          {
            headers: {
              access_token: snsToken,
              client_id: PAYCO_CLIENT_ID,
            },
          },
        );
      }
      if (response.status === 200) {
        if (snsType === SNSTypeEnum.KAKAO) {
          return {
            id: response?.data?.id,
            email: response?.data?.kakao_account?.email,
            name: response?.data?.properties?.nickname,
            isActive: false,
            isSocial: true,
          };
        }
        if (snsType === SNSTypeEnum.GOOGLE) {
          return {
            name: response?.data?.name,
            email: response?.data?.email,
            id: response?.data?.sub,
            isActive: false,
            isSocial: true,
          };
        }
        if (snsType === SNSTypeEnum.NAVER) {
          return {
            name: response?.data?.response?.name,
            email: response?.data?.response?.email,
            id: response?.data?.response?.id,
            isActive: false,
            isSocial: true,
          };
        }
        if (snsType === SNSTypeEnum.PAYCO) {
          return {
            name: response?.data?.data?.member?.name,
            email: response?.data?.data?.member?.email,
            id: response?.data?.data?.member?.idNo,
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
    } else if (input.snsType === SNSTypeEnum.KAKAO) {
      con = { kakaoId: uSocial?.id };
    } else if (input.snsType === SNSTypeEnum.NAVER) {
      con = { naverId: uSocial?.id };
    } else {
      con = { paycoId: uSocial?.id };
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
    if (!user.isActive) throw new Error(errorName.USER_DEACTIVE);
    try {
      const authToken = await this.saveAuthToken(result, {
        issuer: 'klc',
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

  sendResetPasswordMail = async (email: string): Promise<boolean> => {
    const userInfo = await this.usersService.findByEmail(email);
    if (!userInfo) throw new Error(errorName.EMAIL_NOT_EXIST);
    const { password, passwordSalt, ...result } = userInfo;
    const domain = result.roles === AppRoles.ADMIN ? process.env.DASHBOARD_DOMAIN : process.env.WEB_DOMAIN;

    const token = this.initChangePassToken({ id: userInfo.id });

    const content = await this.handlebarsAdapter.compile({
      template: 'reset-password',
      context: {
        username: userInfo.name,
        resetLink: `${domain || ''}/auth/reset?e=${token.accessToken}`,
      },
    });
    const params = createEmailParam({
      content,
      receiver: [userInfo.email],
      sender: process.env.AWS_SES_SENDER_EMAIL,
      subject: 'Laundry O2O - 비밀번호 재설정',
    });
    return (await sendEmail(params))?.succces ? true : false;
  };

  findEmailByPhone = async (name: string, phone: string, code: string): Promise<User | undefined> => {
    const verified = await this.validateOTPCode(phone, code);
    if (verified) {
      const user = await this.usersService.find({ name, phone });
      if (user) {
        await this.removeOtp(code);
        return user;
      }
      throw new Error(errorName.FIND_USER_NOT_EXIST);
    } else throw new Error(errorName.INVALID_OTP);
  };

  sendOTPCode = async (phone: string): Promise<boolean> => {
    const oldOtp = await this.optRepository.find({ phone: phone });
    if (oldOtp) {
      await this.optRepository.remove(oldOtp);
    }
    const code = this.randomInteger(1000, 9999).toString();
    const sent = await sendSMS(`본인인증 번호는 ${code} 입니다. 정확히 입력해주세요.`, phone);
    if (sent) {
      const otp = this.optRepository.create({ phone: phone, code: code });
      await this.optRepository.save(otp);
      return true;
    }
    return false;
  };

  validateOTPCode = async (phone: string, code: string): Promise<boolean> => {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Otp)
      .where('createdAt <= :time', { time: new Date(new Date().getTime() - 600000) })
      .execute();

    const otp = await this.optRepository.findOne({
      where: {
        phone,
        code,
      },
    });
    if (otp) {
      // await this.optRepository.delete(otp.id);
      // await this.optRepository.update(otp.id, { isValid: true });
      return true;
    }
    throw new Error(errorName.INVALID_OTP);
  };

  removeOtp = (code: string) => {
    return this.optRepository.delete({ code });
  };

  requestChangePassword = async (
    name: string,
    phone: string,
    code: string,
    email: string,
  ): Promise<string | undefined> => {
    const verified = await this.validateOTPCode(phone, code);
    if (!verified) throw new Error(errorName.INVALID_OTP);
    const user = await this.usersService.find({ name, phone, email });
    if (!user) throw new Error(errorName.FIND_USER_NOT_EXIST);
    await this.removeOtp(code);
    const token = this.initChangePassToken({ id: user.id });
    return token.accessToken;
  };

  changePasswordToken = async (password: string, token: string): Promise<boolean | undefined> => {
    const data = this.jwtService.decode(token);
    if (data) {
      await this.usersService.update(data['id'], { password });
      return true;
    } else {
      throw new Error(errorName.INVALID_TOKEN);
    }
  };

  changePassword = async (user: User, input: ChangePasswordInput): Promise<boolean | undefined> => {
    const check = bcrypt.compareSync(input.old_password, user.password);
    if (check) {
      await this.usersService.update(user.id, { password: input.new_password });
      return true;
    } else {
      throw new Error(errorName.INVALID_OLD_PASSWORD);
    }
  };

  randomInteger = (min, max): string => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return `${Math.floor(Math.random() * (max - min + 1)) + min}`;
  };

  setRole = (id: string, roles: AppRoles): Promise<User | undefined> => {
    if (roles !== AppRoles.USER && roles !== AppRoles.OWNER) throw new Error(errorName.NOT_FOUND);
    return this.usersService.update(id, { roles });
  };

  deleteToken = (token: string, userId: string): Promise<DeleteResult> => {
    return this.authRepository.delete({ accessToken: token, userId });
  };
}
