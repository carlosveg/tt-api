import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserMinorista, UserScore } from './entities';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { S3Service } from 'src/s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UsersController],
  providers: [UsersService, S3Service],
  imports: [
    TypeOrmModule.forFeature([User, UserScore, UserMinorista]),
    ConfigModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
