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
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { MinoristaDto } from './dto/minorista.dto';
import { UserMinorista } from './entities';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  /* DEPRECATED */
  async create(createUserDto: CreateUserDto) {
    try {
      const { urlImgProfile = 'http://default.png', ...userDetails } =
        createUserDto;

      const user = this.userRepository.create({
        ...userDetails,
      });

      /* 
        Esta parte se debe surtituir por la subida de archivos a s3
        
        Por otro lado la entidad se va a modificar para que la columna
        urlImgProfile ya no sea una relación sino una columna string
       */
      /* if (urlImgProfile) {
        const userImage = this.userImageRepository.create({
          url: urlImgProfile,
        });
        user.urlImgProfile = userImage;
      } */

      await this.userRepository.save(user);

      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: { minorista: true, opinions: true },
    });

    users.forEach((user) => {
      delete user.password;
      // delete user.opinions;
      // delete user.userType;
      // // delete user.isActive;
      // delete user.updatedAt;
    });

    /* return users.map((user) => ({
      ...user,
      urlImgProfile: user.urlImgProfile.url,
    })); */
    return users;
  }

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

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ curp: id });

    if (!user) throw new NotFoundException(`User with CURP [${id}] not found`);

    if (user.userType === 1) return this.getMinorista(id);

    /* QueryBuilder */
    // const queryBuilder = this.userRepository.createQueryBuilder();
    // user = await queryBuilder.where(`id = :id`, { id: id }).getOne();

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    photo: Express.Multer.File,
  ) {
    //const { urlImgProfile, ...toUpdate } = updateUserDto;

    const userDB = await this.findOne(id);

    if (updateUserDto.password)
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);

    const user = await this.userRepository.preload({
      ...userDB,
      ...updateUserDto,
    });

    if (!user) throw new NotFoundException(`User with curp [${id}] not found`);

    // create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (photo) {
        // await queryRunner.manager.delete(UserImage, { user: { curp: id } });
        const name = `${uuid()}.${photo.originalname.split('.')[1]}`;
        const url = await this.s3Service.uploadFile(photo, name);
        user.urlImgProfile = url;
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

    const updatedUser = await this.update(id, { isActive: false }, null);

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

  /* 
    Favorites section
   */
  async getFavoritesByUser(curp: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { curp },
        relations: ['favorites'],
      });

      if (!user) throw new NotFoundException(`User not found`);

      const favorites = user.favorites;

      return favorites;
    } catch (error) {
      throw new Error(`Error while fetching favorites users: ${error.message}`);
    }
  }

  async addFavorite(id: string, favoriteUserId: string) {
    const user = await this.userRepository.findOne({
      where: { curp: id },
      relations: { favorites: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const favoriteUser = await this.userRepository.findOne({
      where: { curp: favoriteUserId },
    });

    if (!favoriteUser)
      throw new NotFoundException(
        `Favorite user [${favoriteUserId}] not found`,
      );

    if (!user.favorites.some((u) => u.curp === favoriteUserId)) {
      user.favorites.push(favoriteUser);
      await this.userRepository.save(user);
    } else throw new BadRequestException('User is already in your favorites');

    return {
      status: HttpStatus.OK,
      message: 'User favorite was added successfully',
    };
  }

  async removeFavorite(id: string, favoriteUserId: string) {
    const user = await this.userRepository.findOne({
      where: { curp: id },
      relations: ['favorites'],
    });

    if (!user) throw new NotFoundException('User not found');

    const favoriteUserIndex = user.favorites.findIndex(
      (u) => u.curp === favoriteUserId,
    );

    if (favoriteUserIndex === -1)
      throw new NotFoundException('Favorite user id not found');

    user.favorites.splice(favoriteUserIndex, 1);

    await this.userRepository.save(user);

    return {
      status: HttpStatus.OK,
      message: 'User favorite was deleted successfully',
    };
  }

  /* Minorista */
  async createMinorista(id: string, minoristaDto: MinoristaDto) {
    try {
      const user = await this.userRepository.findOne({ where: { curp: id } });
      const isMinorista = await this.minoristaRepository.findOne({
        where: { id },
      });

      if (!user) throw new NotFoundException('User not found');
      console.log(`User type => ${user.userType} ${typeof user.userType}`);
      if (isMinorista) {
        console.log('desmadre');
        throw new BadRequestException('Ya es minorista');
      }

      console.log('llega aqui');
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
