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
import { errorName } from 'src/errors';
import slugify from "slugify";
import { MediaService } from 'src/modules/media/services/media.service';
import { NewUserInput } from 'src/modules/users/dto/new_user.input';

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
    private readonly mediaService: MediaService
  ) { }

  findOne = async (conditions?: FindConditions<AuthTokenEntity>) => {
    return await this.authRepository.findOne(conditions);
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

  saveAuthToken = async (userInfo: Pick<User, 'id' | 'name'>, options?: JwtGenerateOption) => {
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
      const user = this.usersService.findById(currentPayload.id);
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

  // register = async (userRegister: UserRegister): Promise<User> => {
  //   const uSocial = await this.getUserSNSToken(userRegister.zaloCode);

  //   console.log(uSocial)

  //   const user = await this.usersService.create(uSocial);

  //   return user;
  // };

  // getUserSNSToken = async (zaloCode: string) => {
  //   const getToken = await fetch(`https://oauth.zaloapp.com/v3/access_token?app_id=3939276768564689931&app_secret=KIzJ3MGOXJCF8XI8N6s6&code=${zaloCode}`)
  //   const resToken = await getToken.json()

  //   // const getInfo = await fetch(`https://graph.zalo.me/v2.0/me?access_token=${resToken.access_token}&fields=id,birthday,name,gender,picture`)
  //   // let resInfo = await getInfo.json();

  //   // if (!resInfo) {
  //   const resInfo = await axios({
  //     method: "GET",
  //     url: `https://graph.zalo.me/v2.0/me?access_token=${resToken.access_token}&fields=id,birthday,name,gender,picture.type(large)`,

  //   })
  //   // }
  //   return resInfo.data
  // };

  loginWithSNS = async (input: NewUserInput) => {

    let user = await this.usersService.findWhere({
      where: {
        zaloId: input.zaloId
      },
    });

    if (!user) {
      let nickname = slugify(input.name ?? "", {
        replacement: "_",
        locale: "vi"
      })

      const existAccount = await this.usersService.countByNickname(nickname)
      if (existAccount) {
        nickname += `_${existAccount + 1}`
      }

      const { zaloId, avatarUrl, ...rest } = input;

      const newAvatar = await this.mediaService.addMedia({ filePath: avatarUrl, name: nickname })

      user = await this.usersService.create({ ...rest, nickname, avatar: newAvatar.id, zaloId })
    }


    const { ...result } = user;
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

  deleteToken = (token: string, userId: number): Promise<DeleteResult> => {
    return this.authRepository.delete({ accessToken: token, userId });
  };
}
