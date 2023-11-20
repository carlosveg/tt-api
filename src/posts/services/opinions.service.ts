import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { S3Service } from '../../s3/s3.service';
import { User, UserMinorista } from '../../users/entities';
import { UsersService } from '../../users/services/users.service';
import { CreateOpinionDto } from '../dto/create-opinion.dto';
import { UpdateOpinionDto } from '../dto/update-opinion.dto';
import { Opinion } from '../entities/opinion.entity';
import { Post } from '../entities/post.entity';

@Injectable()
export class OpinionsService {
  private readonly logger = new Logger(OpinionsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMinorista)
    private readonly userMinoristaRepository: Repository<UserMinorista>,
    @InjectRepository(Opinion)
    private readonly opinionRepository: Repository<Opinion>,
    private readonly userService: UsersService,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    idPost: string,
    idUser: string,
    createOpinionDto: CreateOpinionDto,
    photos: Express.Multer.File[],
  ) {
    const postDB = await this.postRepository.findOne({
      where: { id: idPost },
      relations: { user: true },
    });

    if (!postDB) throw new NotFoundException('Post not found');

    // let user: User | UserMinorista = await this.userMinoristaRepository.findOne(
    //   { where: { id: idUser }, relations: { user: true } },
    // );

    // Se busca al usuario que hizo la opinion por su id para asociarlo a la opinion
    const user = await this.userRepository.findOne({ where: { id: idUser } });

    if (!user) throw new NotFoundException('User not found');

    // user = user.user;

    try {
      const images = [];

      if (photos.length > 0) {
        const imagesUrl = await this.s3Service.uploadFiles(photos);
        imagesUrl.forEach((url) => {
          const image = this.imageRepository.create({ url });
          images.push(image);
        });
        await this.imageRepository.save(images);
      }

      const opinion = this.opinionRepository.create({
        ...createOpinionDto,
        user,
        images,
        post: postDB,
      });

      await this.opinionRepository.save(opinion);

      return {
        status: HttpStatus.CREATED,
        message: 'Opinion creada con exito',
      };
    } catch (error) {
      this.logger.error(error);
    }
  }

  async findOne(id: string) {
    const opinion = await this.opinionRepository.findOneBy({ id });

    if (!opinion) throw new BadRequestException('Resource not found :c');

    return opinion;
  }

  async findAll() {
    const opinions = await this.opinionRepository.find({
      relations: { images: true, user: true, post: true },
    });

    return opinions.map((post) => {
      const { images, ...rest } = post;

      return { ...rest, images: images.map((image) => image.url) };
    });
  }

  /* debo ver la estructura con que devolvere los datos */
  async findAllByUser(id: string) {
    const posts = await this.postRepository.find({
      where: { user: { id } },
      relations: { user: true, images: true },
    });

    return posts.map((post) => ({
      ...post,
      user: post.user.id,
      images: post.images.map((image) => image.url),
    }));
  }

  async findAllByPost(id: string) {
    const opinions = await this.opinionRepository.find({
      where: { post: { id } },
    });

    return opinions.map((op) => {
      const { user, images, ...rest } = op;

      return {
        ...rest,
        user: { fullName: user.fullName },
        images: images.map((img) => img.url),
      };
    });
  }

  async update(
    id: string,
    updateOpinionDto: UpdateOpinionDto,
    photos: Express.Multer.File[],
  ) {
    const opinionDB = await this.findOne(id);

    if (!opinionDB)
      throw new NotFoundException(`Opinion with id ${id} not found`);

    Object.assign(opinionDB, updateOpinionDto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (photos.length > 0) {
        const images = [];
        const imagesUrl = await this.s3Service.uploadFiles(photos);

        imagesUrl.forEach((url) => {
          const image = this.imageRepository.create({ url });
          images.push(image);
        });

        await this.imageRepository.save(images);
        opinionDB.images = images;
      }

      // intenta guardar
      await queryRunner.manager.save(opinionDB);
      // hace el commit de la transaccion
      await queryRunner.commitTransaction();
      // desconecta el queryRunner
      await queryRunner.release();

      return {
        status: HttpStatus.OK,
        message: 'Resource was successfuly updated',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.logger.error(error);
    }
  }

  async remove(id: string) {
    const opinion = await this.opinionRepository.findOne({ where: { id } });

    if (!opinion) throw new NotFoundException(`Resource not found [${id}]`);

    await this.opinionRepository.remove(opinion);

    return {
      status: HttpStatus.OK,
      message: 'Resource was successfuly deleted',
    };
  }
}
