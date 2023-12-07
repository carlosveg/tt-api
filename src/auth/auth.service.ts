import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { CreateUserDto, LoginUserDto } from '../users/dto';
import { User } from '../users/entities/';
import { JwtPayload } from './interfaces/jtw-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private s3Service: S3Service,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto, photo: Express.Multer.File) {
    try {
      const { password, curp, ...rest } = createUserDto;
      /*
        TODO: hashear el curp del usuario y hacer que funcione la verificacion si ya existe
      */
      const users = await this.userRepository.find({ select: { curp: true } });

      for (const user of users) {
        if (bcrypt.compareSync(curp, user.curp)) {
          throw new ConflictException(
            `User with curp [${createUserDto.curp}] already exists`,
          );
        }
      }

      const user = this.userRepository.create({
        ...rest,
        curp: bcrypt.hashSync(curp, 10),
        password: bcrypt.hashSync(password, 10),
      });

      /* si hay imagen entonces la mando al s3 */
      if (photo) {
        const name = `${photo.originalname.split('.')[0]}${Date.now()}.${
          photo.originalname.split('.')[1]
        }`;
        const url = await this.s3Service.uploadFile(photo, name);
        user.urlImgProfile = url;
      }

      await this.userRepository.save(user);
      delete user.password;

      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, isActive: true },
    });

    if (!user) throw new UnauthorizedException('Not valid credentials');

    if (!user.isActive)
      throw new ConflictException({
        userId: user.id,
        message: 'Cuenta inactiva, solicite reactivacion',
      });

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Not valid credentials');

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException(error.response);
  }
}
