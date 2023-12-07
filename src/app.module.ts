import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';
import { ImagesModule } from './images/images.module';
import { PostsModule } from './posts/posts.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { S3Module } from './s3/s3.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod' ? true : false,
      extra: {
        ssl: process.env.STAGE === 'prod' ? true : false,
      },

      type: 'postgres',
      host:
        process.env.STAGE === 'prod'
          ? process.env.DB_HOST
          : process.env.DB_HOST_DEV,
      port:
        process.env.STAGE === 'prod'
          ? +process.env.DB_PORT
          : +process.env.DB_PORT_DEV,
      database:
        process.env.STAGE === 'prod'
          ? process.env.DB_NAME
          : process.env.DB_NAME_DEV,
      username:
        process.env.STAGE === 'prod'
          ? process.env.DB_USERNAME
          : process.env.DB_USERNAME_DEV,
      password:
        process.env.STAGE === 'prod'
          ? process.env.DB_PASSWORD
          : process.env.DB_PASSWORD_DEV,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
    UsersModule,
    CommonModule,
    PostsModule,
    ImagesModule,
    SeedModule,
    FilesModule,
    AuthModule,
    S3Module,
    NotificationsModule,
    EmailModule,
  ],
})
export class AppModule {}
