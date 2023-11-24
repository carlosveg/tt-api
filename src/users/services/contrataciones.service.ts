import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Contrataciones } from '../entities/contratacion.entity';
import { UserMinorista } from '../entities';
import { ContratacionDto } from '../dto/contratacion.dto';
import { EmailService } from '../../email/email.service';

@Injectable()
export class ContratacionesService {
  private readonly logger = new Logger(ContratacionesService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
    @InjectRepository(Contrataciones)
    private readonly contratacionesRepository: Repository<Contrataciones>,
    private readonly emailService: EmailService,
  ) {}

  async getContratacionesByUser(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) throw new NotFoundException(`User not found`);

      // const contrataciones = await this.contratacionesRepository.findOne({
      //   where: { usuario: { id } },
      // });

      return user.contrataciones;
    } catch (error) {
      throw new Error(`Error while fetching contrataciones: ${error.message}`);
    }
  }

  async create(
    idContratador: string,
    idContratado: string,
    contratacionDto: ContratacionDto,
  ) {
    const contratador = await this.userRepository.findOne({
      where: { id: idContratador },
      relations: { favorites: true },
    });

    if (!contratador) throw new NotFoundException('User not found');

    const minorista = await this.minoristaRepository.findOne({
      where: { id: idContratado },
      relations: { user: true },
    });

    if (!minorista)
      throw new NotFoundException(
        `Minorista with id [${idContratado}] not found`,
      );

    const contratacion = this.contratacionesRepository.create({
      usuario: contratador,
      minorista,
    });

    try {
      await this.contratacionesRepository.save(contratacion);
    } catch (error) {
      this.logger.error('Ocurrió un error al guardar la contratación');
      throw new InternalServerErrorException(
        'Ocurrió un error al guardar la contratación',
      );
    }

    await this.emailService.sendEmailContratacion(
      contratador.email,
      [minorista.user.email],
      contratacionDto.content,
    );

    return {
      status: HttpStatus.OK,
      message: 'Contratacion was created successfully',
    };
  }

  async remove(idContratador: string, idContratado: string) {
    const contratador = await this.userRepository.findOne({
      where: { id: idContratador },
    });

    if (!contratador)
      throw new NotFoundException(`User with id [${idContratador}] not found`);

    const minorista = await this.minoristaRepository.findOne({
      where: { id: idContratado },
      relations: { user: true },
    });

    if (!minorista)
      throw new NotFoundException(
        `Minorista with id [${idContratado}] not found`,
      );

    const contratacion = await this.contratacionesRepository.findOne({
      where: {
        usuario: { id: idContratador },
        minorista: { id: idContratado },
      },
    });

    if (!contratacion)
      throw new NotFoundException(
        `Contratacion entre ${contratador.fullName} y minorista [${minorista.user.fullName}] not found`,
      );

    await this.contratacionesRepository.remove(contratacion);

    return {
      status: HttpStatus.OK,
      message: 'Contratacion was deleted successfully',
    };
  }

  async validateContratacion(idUser: string, idContratacion: string) {
    const contrataciones = await this.getContratacionesByUser(idUser);
    console.log(contrataciones);
    const ids = contrataciones.map((con) => con.minorista.id);

    console.log(ids);

    return ids.includes(idContratacion);
  }
}
