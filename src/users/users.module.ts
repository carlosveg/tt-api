import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserMinorista, UserScore } from './entities';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersService, MinoristaService, FavoritesService } from './services';
import { S3Service } from 'src/s3/s3.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, S3Service, MinoristaService, FavoritesService],
  imports: [
    TypeOrmModule.forFeature([User, UserScore, UserMinorista]),
    ConfigModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
