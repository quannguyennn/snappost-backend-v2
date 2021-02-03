import { Module, DynamicModule } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/modules/users/users.module';
import { AUTH_MODULE_OPTIONS } from './auth.constants';
import { AuthResolver } from './resolvers/auth.resolver';
import { JwtCookieStrategy } from './strategies/jwt_cookie.strategy';
import { AuthModuleOptions } from './auth.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRepository } from './repositories/auth.repository';
import { UniqueEmail, ValidEmail } from './validators/valid_email';
import { OtpRepository } from './repositories/otp.repository';
import { UniquePhone } from './validators/valid_phone';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([AuthRepository, OtpRepository]),
  ],
  providers: [
    //
    AuthService,
    //
    // LocalStrategy,
    JwtStrategy,
    JwtCookieStrategy,
    UniqueEmail,
    ValidEmail,
    UniquePhone,
    //
    AuthResolver,
  ],
  exports: [AuthService],
})
export class AuthModule {
  static forRoot(options?: AuthModuleOptions): DynamicModule {
    if (!options?.secret) {
      throw new Error('JwtStrategy requires a secret or key');
    }
    return {
      module: AuthModule,
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      imports: [
        JwtModule.register({
          secret: options?.secret,
          signOptions: { expiresIn: '30 days', issuer: 'snappost' },
        }),
      ],
    };
  }
}
