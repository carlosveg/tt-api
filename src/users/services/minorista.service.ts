import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { S3Service } from 'src/s3/s3.service';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto, UpdateUserDto } from '../dto';
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
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
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

      user.userType = 1;

      const minorista = this.minoristaRepository.create({
        id,
        ...minoristaDto,
        user,
      });

      this.userRepository.save(user);

      return await this.minoristaRepository.save(minorista);
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException(error.message);
    }
  }

  async getMinorista(id: string) {
    return await this.minoristaRepository.findOne({ where: { id } });
  }
}
