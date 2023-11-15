import {
  ConflictException,
  HttpStatus,
  Injectable,
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

    if (!user)
      throw new NotFoundException(
        'El id del usuario con que intentas hacer la solicitud no se encontró',
      );

    if (user instanceof UserMinorista)
      throw new ConflictException('El usuario ya es minorista');

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
      this.logger.error(error);
    }

    return {
      status: HttpStatus.CREATED,
      message: 'La solicitud fue creada con exito',
    };
  }

  async findAll() {
    const solicitudes = await this.solicitudesRepository.find({
      relations: { user: true },
    });

    const result = solicitudes.map((solicitud) => {
      const { user, ...rest } = solicitud;
      const { id, fullName, email } = user;

      return { ...rest, user: { id, fullName, email } };
    });

    return result;
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
      this.logger.error(error);
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

    return itsOK;
  }

  async rejectSolicitud(idSolicitud: string, idUser: string) {
    await this.userService.findOne(idUser);
    const solicitudDB = await this.solicitudesRepository.findOneBy({
      id: idSolicitud,
    });
    const userDB = await this.userRepository.findOneBy({ id: idUser });

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

    return {
      status: HttpStatus.OK,
      message: 'Solicitud de minorista rechazada con exito',
    };
  }

  async solicitarReactivacionCuenta(id: string) {
    const userDB = await this.userRepository.findOneBy({ id });

    if (!userDB) throw new NotFoundException('User not found');

    const solicitud = this.solicitudesRepository.create({ user: userDB });

    solicitud.title = 'Reactivación de cuenta';
    solicitud.message = `El usuario ${userDB.fullName} ha solicitado la reactivación de su cuenta`;
    solicitud.type = 1;

    await this.solicitudesRepository.save(solicitud);

    return {
      status: HttpStatus.CREATED,
      message: 'La solicitud fue creada con exito',
    };
  }

  async reactivarCuenta(idSolicitud: string, idUser: string) {
    const userDB = await this.userRepository.findOneBy({ id: idUser });

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

    return {
      status: HttpStatus.OK,
      message: 'La cuenta fue reactivada con exito',
    };
  }

  async rechazoReactivarCuenta(idSolicitud: string, idUser: string) {
    const userDB = await this.userRepository.findOneBy({ id: idUser });

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

    return {
      status: HttpStatus.OK,
      message: 'Solicitud de reactivacion de cuenta rechazada con exito',
    };
  }
}
