import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from '../s3/s3.service';
import { User, UserMinorista, UserScores } from './entities';
import {
  FavoritesService,
  MinoristaService,
  ScoresService,
  UsersService,
} from './services';
import { UsersController } from './controllers/users.controller';
import { CatalogosController } from './controllers/catalogos.controller';
import { CatalogoService } from './services/catalogos.service';

@Module({
  controllers: [UsersController, CatalogosController],
  providers: [
    UsersService,
    S3Service,
    MinoristaService,
    FavoritesService,
    ScoresService,
    CatalogoService,
  ],
  imports: [
    TypeOrmModule.forFeature([User, UserScores, UserMinorista]),
    ConfigModule,
    AuthModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
