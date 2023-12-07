import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './controllers/notifications.controller';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { FavNotification, Solicitudes } from './entities';
import { NotificationsService } from './services/notifications.service';
import { SolicitudesService } from './services/solicitudes.service';
import { UsersModule } from '../users/users.module';
import { MinoristaService } from '../users/services';
import { EmailService } from '../email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [NotificationsController, SolicitudesController],
  providers: [
    NotificationsService,
    SolicitudesService,
    MinoristaService,
    EmailService,
  ],
  imports: [
    TypeOrmModule.forFeature([Solicitudes, FavNotification]),
    UsersModule,
    ConfigModule,
  ],
})
export class NotificationsModule {}
