import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from '../s3/s3.service';
import { User, UserMinorista, UserScore } from './entities';
import { FavoritesService, MinoristaService, UsersService } from './services';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService, S3Service, MinoristaService, FavoritesService],
  imports: [
    TypeOrmModule.forFeature([User, UserScore, UserMinorista]),
    ConfigModule,
    AuthModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
