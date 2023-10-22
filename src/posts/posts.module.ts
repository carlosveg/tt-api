import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UsersModule } from 'src/users/users.module';
import { S3Service } from 'src/s3/s3.service';
import { ConfigModule } from '@nestjs/config';
import { Image } from './entities/image.entity';
import { Opinion } from './entities/opinion.entity';
import { OpinionsService } from './opinions.service';
import { OpinionsController } from './opinions.controller';

@Module({
  controllers: [PostsController, OpinionsController],
  providers: [PostsService, S3Service, OpinionsService],
  imports: [
    TypeOrmModule.forFeature([Post, Image, Opinion]),
    UsersModule,
    ConfigModule,
  ],
})
export class PostsModule {}
