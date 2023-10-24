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

      return {
        email: user.email,
        fullName: user.fullName,
        ...rest,
        posts: rest.posts.map((post) => {
          delete post.updatedAt;
          return post;
        }),
      };
    });

    return dataReturned;
  }

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
    return await this.minoristaRepository.findOne({ where: { id } });
  }
}
