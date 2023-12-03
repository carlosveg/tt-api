import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { ValidRoles } from '../../auth/interfaces/valid-roles';
import { S3Service } from '../../s3/s3.service';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { UserMinorista } from '../entities';
import { User } from '../entities/user.entity';
import { MinoristaService } from './minorista.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
    private readonly s3Service: S3Service,
    private readonly minoristaService: MinoristaService,
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
      relations: { minorista: true /* , opinions: true */ },
    });

    users.forEach((user) => {
      delete user.password;
      delete user.curp;
      // delete user.opinions;
      // delete user.userType;
      // delete user.isActive;
      // delete user.updatedAt;
    });

    /* return users.map((user) => ({
      ...user,
      urlImgProfile: user.urlImgProfile.url,
    })); */
    return users;
  }

  async findOne(id: string) {
    this.logger.log(`Obteniendo datos de usuario: ${id}`);
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id [${id}] not found`);

    if (user.userType === ValidRoles.MINORISTA)
      return this.minoristaService.getMinorista(id);

    /* QueryBuilder */
    // const queryBuilder = this.userRepository.createQueryBuilder();
    // user = await queryBuilder.where(`id = :id`, { id: id }).getOne();
    delete user.curp;
    delete user.updatedAt;
    delete user.isActive;
    delete user.password;

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    photo: Express.Multer.File,
  ) {
    this.logger.log(`Actualizando usuario con id: ${id}`);
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
        const name = `${photo.originalname.split('.')[0]}${Date.now()}.${
          photo.originalname.split('.')[1]
        }`;
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

      delete user.password;

      this.logger.log('User successfuly updated');
      return { status: HttpStatus.OK, message: 'User successfuly updated' };
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
    this.logger.log(`Dando de baja al usuario con id: ${id}`);
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    await this.update(id, { isActive: false }, null);

    this.logger.log('User successfuly unsubscribed');
    return {
      status: HttpStatus.OK,
      message: 'User successfuly unsubscribed',
    };
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
