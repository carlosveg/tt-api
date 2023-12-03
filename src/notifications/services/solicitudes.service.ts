import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/services';
import { MinoristaService } from '../../users/services/minorista.service';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { Solicitudes } from '../entities';
import { ValidRoles } from '../../auth/interfaces/valid-roles';
import { UserMinorista } from '../../users/entities/user-minorista.entity';
import { User } from '../../users/entities';
import { MinoristaDto } from '../../users/dto';
import { EmailService } from '../../email/email.service';
import {
  minoristaAccept,
  minoristaReject,
  reactivateAccept,
  reactivateReject,
} from '../messages/messages';

@Injectable()
export class SolicitudesService {
  logger = new Logger(SolicitudesService.name);

  constructor(
    @InjectRepository(Solicitudes)
    private readonly solicitudesRepository: Repository<Solicitudes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly minoristaService: MinoristaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  /* 
  Para crear una solicitud 
   */
  async requestMinorista(id: string, createSolicitudDto: CreateSolicitudDto) {
    const user = await this.userService.findOne(id);
    this.logger.log(
      `[SOLICITUD MINORISTA] El usuario: ${user.fullName} ha solicitado convertirse en minorista`,
    );

    if (!user)
      throw new NotFoundException(
        'El id del usuario con que intentas hacer la solicitud no se encontró',
      );

    if (user instanceof UserMinorista) {
      this.logger.log(
        `[SOLICITUD MINORISTA] El usuario: ${user.fullName} ya es minorista`,
      );
      throw new ConflictException('El usuario ya es minorista');
    }

    const solicitudDB = await this.solicitudesRepository.findOne({
      where: { user: { id } },
    });

    if (solicitudDB)
      throw new ConflictException('El usuario ya tiene una solicitud activa');

    createSolicitudDto.title = 'Solicitud de minorista';
    createSolicitudDto.message = `El usuario ${user.fullName} ha solicitado convertir su cuenta a minorista`;

    try {
      const solicitud = this.solicitudesRepository.create({
        ...createSolicitudDto,
        type: 0,
        user,
      });
      await this.solicitudesRepository.save(solicitud);
    } catch (error) {
      this.logger.error(
        `[SOLICITUD MINORISTA] Ocurrió un error en la solicitud de minorista ${error}`,
      );
    }

    this.logger.log(
      '[SOLICITUD MINORISTA] Se ha registrado exitosamente la solicitud de minorista',
    );
    return {
      status: HttpStatus.CREATED,
      message: 'La solicitud fue creada con exito',
    };
  }

  async findAll() {
    try {
      this.logger.log('Recuperando solicitudes');
      const solicitudes = await this.solicitudesRepository.find({
        relations: { user: true },
      });

      const result = solicitudes.map((solicitud) => {
        const { user, ...rest } = solicitud;
        const { id, fullName, email } = user;

        return { ...rest, user: { id, fullName, email } };
      });

      return result;
    } catch (error) {
      this.logger.error('Ocurrió un error al recuperar las solicitudes', error);
      throw new InternalServerErrorException(
        `Ocurrió un error al recuperar las solicitudes ${error}`,
      );
    }
  }

  async findOne(id: string) {
    const solicitud = await this.solicitudesRepository.find({
      where: { id },
      relations: { user: true },
    });

    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const { user, ...rest } = solicitud[0];
    const { id: userId, fullName, email } = user;

    return { ...rest, user: { userId, fullName, email } };
  }

  async remove(id: string) {
    const solicitud = await this.solicitudesRepository.find({
      where: { id },
      relations: { user: true },
    });

    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    try {
      await this.solicitudesRepository.remove(solicitud[0]);
    } catch (error) {
      this.logger.error(`Ocurrió un error al eliminar la solicitud ${error}`);
      throw new InternalServerErrorException(
        `Ocurrió un error al eliminar la solicitud ${error}`,
      );
    }

    return {
      status: HttpStatus.NO_CONTENT,
      message: 'La solicitud se elimino con exito',
    };
  }

  async convertMinorista(idSolicitud: string, idUser: string) {
    await this.userService.findOne(idUser);
    const solicitudDB = await this.solicitudesRepository.findOneBy({
      id: idSolicitud,
    });
    const userDB = await this.userRepository.findOneBy({ id: idUser });

    this.logger.log(
      `[MINORISTA ACEPTADO] Procesando solicitud del usuario ${userDB.fullName}`,
    );

    if (!solicitudDB)
      throw new NotFoundException(
        `No se encontró la solicitud con id [${idSolicitud}]`,
      );

    solicitudDB.isRead = true;
    solicitudDB.isAccepted = true;

    const minoristaDto = {
      ocupacion: solicitudDB.ocupacion,
      description: solicitudDB.description,
      latitud: solicitudDB.latitud,
      longitud: solicitudDB.longitud,
    };

    await this.solicitudesRepository.save(solicitudDB);

    const itsOK = await this.minoristaService.createMinorista(
      idUser,
      minoristaDto as MinoristaDto,
    );

    this.emailService.sendEmail(
      userDB.fullName,
      [userDB.email],
      minoristaAccept,
    );

    this.logger.log(
      `[MINORISTA ACEPTADO] Solicitud del usuario ${userDB.fullName} aceptada  con exito`,
    );
    this.logger.log(
      `[MINORISTA ACEPTADO] Se ha enviado una notificación al correo ${userDB.email}`,
    );

    return itsOK;
  }

  async rejectSolicitud(idSolicitud: string, idUser: string) {
    await this.userService.findOne(idUser);
    const solicitudDB = await this.solicitudesRepository.findOneBy({
      id: idSolicitud,
    });
    const userDB = await this.userRepository.findOneBy({ id: idUser });

    this.logger.log(
      `[MINORISTA RECHAZADO] Procesando solicitud del usuario ${userDB.fullName}`,
    );

    if (!solicitudDB)
      throw new NotFoundException(
        `No se encontró la solicitud con id [${idSolicitud}]`,
      );

    solicitudDB.isRead = true;
    solicitudDB.isAccepted = false;

    await this.solicitudesRepository.save(solicitudDB);

    this.emailService.sendEmail(
      userDB.fullName,
      [userDB.email],
      minoristaReject,
    );

    this.logger.log(
      `[MINORISTA RECHAZADO] Solicitud del usuario ${userDB.fullName} aceptada  con exito`,
    );
    this.logger.log(
      `[MINORISTA RECHAZADO] Se ha enviado una notificación al correo ${userDB.email}`,
    );

    return {
      status: HttpStatus.OK,
      message: 'Solicitud de minorista rechazada con exito',
    };
  }

  async solicitarReactivacionCuenta(id: string) {
    const userDB = await this.userRepository.findOneBy({ id });

    if (!userDB) throw new NotFoundException('User not found');

    this.logger.log(
      `[SOLICITUD REACTIVACIÓN] El usuario: ${userDB.fullName} ha solicitado reactivar su cuenta`,
    );

    const solicitud = this.solicitudesRepository.create({ user: userDB });

    solicitud.title = 'Reactivación de cuenta';
    solicitud.message = `El usuario ${userDB.fullName} ha solicitado la reactivación de su cuenta`;
    solicitud.type = 1;

    await this.solicitudesRepository.save(solicitud);

    this.logger.log(
      `[SOLICITUD REACTIVACIÓN] Se ha registrado con éxito la solicitud para reactivar su cuenta`,
    );

    return {
      status: HttpStatus.CREATED,
      message: 'La solicitud fue creada con exito',
    };
  }

  async reactivarCuenta(idSolicitud: string, idUser: string) {
    const userDB = await this.userRepository.findOneBy({ id: idUser });

    this.logger.log(
      `[REACTIVACIÓN ACEPTADA] Procesando solicitud del usuario ${userDB.fullName}`,
    );

    const solicitudDB = await this.solicitudesRepository.findOneBy({
      id: idSolicitud,
    });

    if (!solicitudDB)
      throw new NotFoundException(
        `No se encontró la solicitud con id [${idSolicitud}]`,
      );

    solicitudDB.isRead = true;
    solicitudDB.isAccepted = true;
    await this.solicitudesRepository.save(solicitudDB);

    // Reactivamos la cuenta
    userDB.isActive = true;
    await this.userRepository.save(userDB);

    this.emailService.sendEmail(
      userDB.fullName,
      [userDB.email],
      reactivateAccept,
    );

    this.logger.log(
      `[REACTIVACIÓN ACEPTADa] Solicitud del usuario ${userDB.fullName} aceptada  con exito`,
    );
    this.logger.log(
      `[REACTIVACIÓN ACEPTADA] Se ha enviado una notificación al correo ${userDB.email}`,
    );

    return {
      status: HttpStatus.OK,
      message: 'La cuenta fue reactivada con exito',
    };
  }

  async rechazoReactivarCuenta(idSolicitud: string, idUser: string) {
    const userDB = await this.userRepository.findOneBy({ id: idUser });

    this.logger.log(
      `[REACTIVACIÓN RECHAZADA] Procesando solicitud del usuario ${userDB.fullName}`,
    );

    const solicitudDB = await this.solicitudesRepository.findOneBy({
      id: idSolicitud,
    });

    if (!solicitudDB)
      throw new NotFoundException(
        `No se encontró la solicitud con id [${idSolicitud}]`,
      );

    solicitudDB.isRead = true;
    solicitudDB.isAccepted = false;
    await this.solicitudesRepository.save(solicitudDB);

    this.emailService.sendEmail(
      userDB.fullName,
      [userDB.email],
      reactivateReject,
    );

    this.logger.log(
      `[REACTIVACIÓN RECHAZADA] Solicitud del usuario ${userDB.fullName} aceptada  con exito`,
    );
    this.logger.log(
      `[REACTIVACIÓN RECHAZADA] Se ha enviado una notificación al correo ${userDB.email}`,
    );

    return {
      status: HttpStatus.OK,
      message: 'Solicitud de reactivacion de cuenta rechazada con exito',
    };
  }
}
