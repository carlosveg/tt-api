import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from '../s3/s3.service';
import { UsersController } from './controllers/users.controller';
import { User, UserMinorista, UserScores } from './entities';
import {
  FavoritesService,
  MinoristaService,
  ScoresService,
  UsersService,
} from './services';
import { Contrataciones } from './entities/contratacion.entity';
import { ContratacionesController } from './controllers/contrataciones.controller';
import { ContratacionesService } from './services/contrataciones.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [UsersController, ContratacionesController],
  providers: [
    UsersService,
    S3Service,
    MinoristaService,
    FavoritesService,
    ScoresService,
    ContratacionesService,
    EmailService,
  ],
  imports: [
    TypeOrmModule.forFeature([User, UserScores, UserMinorista, Contrataciones]),
    ConfigModule,
    AuthModule,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
