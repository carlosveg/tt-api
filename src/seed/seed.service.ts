import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { Image } from '../posts/entities/image.entity';
import { Post } from '../posts/entities/post.entity';
import { MinoristaDto } from '../users/dto';
import { User, UserMinorista } from '../users/entities';
import { Contrataciones } from '../users/entities/contratacion.entity';
import { UsersService } from '../users/services/users.service';
import { minoristaSeed } from './data/minoristas';
import { users } from './data/users';

@Injectable()
export class SeedService {
  constructor(
    private readonly userService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
    @InjectRepository(Contrataciones)
    private readonly contratacionesRepository: Repository<Contrataciones>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async runSeed() {
    const users = await this.insertUsers();

    const adminFilter = users.filter((user) => user.userType === 'admin');
    const usersFilter = users.filter((user) => user.userType === 'user');
    const minoristasFilter = users.filter(
      (user) => user.userType === 'minorista',
    );

    const minoristas = await this.insertMinorista(minoristasFilter);

    await this.insertContrataciones(minoristas[1].id, minoristasFilter[7].id);

    return 'SEED executed';
  }

  async destroyDB() {
    // Esta linea elimina a los usuarios y en cascada todos los registros de la bd
    await this.userService.deleteAllUsers();
  }

  private async insertUsers() {
    // Antes de insertar, destruimos la BD por completo
    await this.destroyDB();
    const insertPromises: User[] = [];

    users.forEach((user: User) => {
      insertPromises.push(this.userRepository.create(user));
    });

    // await Promise.all(insertPromises);
    const usersDB = await this.userRepository.save(insertPromises);

    return usersDB;
  }

  private async insertMinorista(minoristasFilter: User[]) {
    const minoristasDB: UserMinorista[] = [];

    for (let i = 0; i < minoristaSeed.length; i++) {
      const dto: MinoristaDto = minoristaSeed[i];
      const userSeed = minoristasFilter[i];

      const minorista = this.minoristaRepository.create({
        id: userSeed.id,
        ...dto,
        user: userSeed,
      });

      minoristasDB.push(await this.minoristaRepository.save(minorista));
    }

    return minoristasDB;
  }

  private async insertContrataciones(
    idContratador: string,
    idContratado: string,
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

    const c = await this.contratacionesRepository.save(contratacion);
    console.log(c);
  }

  private async createPost(
    id: string,
    createPostDto: CreatePostDto,
    photos: string[],
  ) {
    try {
      const user = await this.minoristaRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!user) throw new BadRequestException('User not found');

      const images = [];

      if (photos.length > 0) {
        photos.forEach((url) => {
          const image = this.imageRepository.create({ url });
          images.push(image);
        });

        await this.imageRepository.save(images);
      }

      const post = this.postRepository.create({
        ...createPostDto,
        user,
        images,
      });

      await this.postRepository.save(post);
    } catch (error) {
      console.error(`Ocurrió un eror al crear el post ${error}`);
      throw new NotFoundException(error.message);
    }
  }
}
