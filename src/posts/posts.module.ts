import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from '../s3/s3.service';
import { UsersModule } from '../users/users.module';
import { Image } from './entities/image.entity';
import { Opinion } from './entities/opinion.entity';
import { Post } from './entities/post.entity';
import { OpinionsController } from './opinions.controller';
import { OpinionsService } from './services/opinions.service';
import { PostsController } from './posts.controller';
import { PostsService } from './services/posts.service';
import { FavoritesService } from '../users/services';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [PostsController, OpinionsController],
  providers: [
    PostsService,
    S3Service,
    OpinionsService,
    FavoritesService,
    EmailService,
  ],
  imports: [
    TypeOrmModule.forFeature([Post, Image, Opinion]),
    UsersModule,
    ConfigModule,
    AuthModule,
  ],
  exports: [TypeOrmModule],
})
export class PostsModule {}
