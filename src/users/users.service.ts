import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /*
    TODO: Pagination
  */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.userRepository.find({ take: limit, skip: offset });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ curp: id });

    if (!user) throw new NotFoundException(`User with CURP [${id}] not found`);

    /* QueryBuilder */
    // const queryBuilder = this.userRepository.createQueryBuilder();
    // user = await queryBuilder.where(`id = :id`, { id: id }).getOne();

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      curp: id,
      ...updateUserDto,
    });

    if (!user) throw new NotFoundException(`User with curp [${id}] not found`);

    try {
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    this.logger.error(error.detail);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
