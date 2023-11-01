import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidRoles } from '../../auth/interfaces/valid-roles';
import { MinoristaDto } from '../dto/minorista.dto';
import { UserMinorista } from '../entities';
import { User } from '../entities/user.entity';

@Injectable()
export class MinoristaService {
  private readonly logger = new Logger(MinoristaService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
  ) {}

  async findAllMinoristas() {
    const users = await this.minoristaRepository.find({
      relations: { user: true, posts: true },
    });

    const dataReturned = users.map((u) => {
      const { user, ...rest } = u;

      delete user.updatedAt;
      delete user.solicitudes;
      delete user.curp;
      delete user.favNotifications;
      delete user.favoritedBy;
      delete user.password;

      return {
        // id: user.id,
        // email: user.email,
        // fullName: user.fullName,
        // userType: user.userType,
        ...user,
        minorista: {
          ...rest,
          posts: rest.posts.map((post) => {
            delete post.updatedAt;
            return post;
          }),
        },
      };
    });

    return dataReturned;
  }

  /* DEPRECATED
    Descripcion: Este metodo no lo usaremos porque convierte en automatico al usuario en minorista
    Se van a implementar 2 nuevos metodos
      -> para guardar la solicitud
      -> para que el admin acepte la solicitud y entonces el usuario sea convertido a minorista
   */
  async createMinorista(id: string, minoristaDto: MinoristaDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      const isMinorista = await this.minoristaRepository.findOne({
        where: { id },
      });

      if (!user) throw new NotFoundException('User not found');

      if (isMinorista) {
        throw new BadRequestException('Ya es minorista');
      }

      user.userType = ValidRoles.MINORISTA;

      const minorista = this.minoristaRepository.create({
        id,
        ...minoristaDto,
        user,
      });

      this.userRepository.save(user);

      await this.minoristaRepository.save(minorista);

      return {
        status: HttpStatus.CREATED,
        message: 'Usuario convertido a minorista',
      };
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException(error.message);
    }
  }

  async getMinorista(id: string) {
    const minorista = await this.minoristaRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    const { user, ...rest } = minorista;

    return { minorista: rest, ...user };
  }
}
