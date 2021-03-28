import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { gqlOptions } from './graphql/gql-options';
import { AuthModule } from './modules/auth/auth.module';
import { MediaModule } from './modules/media/media.module';
import { UsersModule } from './modules/users/users.module';
import { typeORMConfig } from './typeorm.config';
import { TemplateModule } from './modules/template/template.module';
import { PostModule } from './modules/post/post.module';
import { FollowModule } from './modules/follow/follow.module';
import { NotificationModule } from 'src/modules/notifications/notification.module';
import { ChatModule } from 'src/modules/chat/chat.module';
import { CronModule } from './modules/cron/cron.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    MediaModule.forRoot({
      uploadDir: 'uploads',
      quality: 70,
    }),
    PromModule.forRoot({
      defaultLabels: {
        app: 'my_app',
      },
      // customUrl:'/'
    }),
    GraphQLModule.forRoot(gqlOptions),
    AuthModule.forRoot({
      secret: 'snappost secret',
    }),
    TemplateModule.forRoot({
      dir: __dirname + '/email-templates',
    }),
    UsersModule,
    PostModule,
    FollowModule,
    NotificationModule,
    ChatModule,
    CronModule
  ],
  // providers: [JSONObjectScalar],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
