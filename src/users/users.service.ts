import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserImage } from './entities';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserImage)
    private readonly userImageRepository: Repository<UserImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { urlImgProfile = 'http://default.png', ...userDetails } =
        createUserDto;

      const user = this.userRepository.create({
        ...userDetails,
      });

      if (urlImgProfile) {
        const userImage = this.userImageRepository.create({
          url: urlImgProfile,
        });
        user.urlImgProfile = userImage;
      }

      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      relations: { urlImgProfile: true },
    });

    return users.map((user) => ({
      ...user,
      urlImgProfile: user.urlImgProfile.url,
    }));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ curp: id });

    if (!user) throw new NotFoundException(`User with CURP [${id}] not found`);

    /* QueryBuilder */
    // const queryBuilder = this.userRepository.createQueryBuilder();
    // user = await queryBuilder.where(`id = :id`, { id: id }).getOne();

    return user;
  }

  async findOnePlain(term: string) {
    const { urlImgProfile = 'http://default.png', ...rest } =
      await this.findOne(term);

    return { ...rest, urlImgProfile: urlImgProfile };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { urlImgProfile, ...toUpdate } = updateUserDto;

    const userDB = await this.findOne(id);

    const user = await this.userRepository.preload({
      ...userDB,
      ...toUpdate,
    });

    if (!user) throw new NotFoundException(`User with curp [${id}] not found`);

    // create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (urlImgProfile) {
        await queryRunner.manager.delete(UserImage, { user: { curp: id } });

        user.urlImgProfile = this.userImageRepository.create({
          url: urlImgProfile,
        });
      }

      // intenta guardar
      await queryRunner.manager.save(user);
      // hace el commit de la transaccion
      await queryRunner.commitTransaction();
      // desconecta el queryRunner
      await queryRunner.release();

      //await this.userRepository.save(user);

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  /* 
    Al realizar el la eliminación de un usuario se hará una [eliminación lógica]
    ya que si se hace una [eliminación física] va a afectar otros procesos, tales como:
      - Calificación
      - Reseñas
   */
  async remove(id: string) {
    const user = await this.findOne(id);

    if (!user) throw new BadRequestException();

    const updatedUser = await this.update(id, { isActive: false });

    //await this.userRepository.remove(user);
    return updatedUser;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    this.logger.error(error.detail);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllUsers() {
    const query = this.userRepository.createQueryBuilder('user');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
