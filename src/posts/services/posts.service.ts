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
import { UserMinorista } from '../../users/entities';
import { UsersService } from '../../users/services/users.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Opinion } from '../entities/opinion.entity';
import { Post } from '../entities/post.entity';
import { catalogEnum } from '../../common/enum';
import { EmailService } from '../../email/email.service';
import { FavoritesService } from '../../users/services/favorites.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(UserMinorista)
    private readonly userMinoristaRepository: Repository<UserMinorista>,
    @InjectRepository(Opinion)
    private readonly opinionRepository: Repository<Opinion>,
    private readonly userService: UsersService,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly emailService: EmailService,
    private readonly favoritesService: FavoritesService,
  ) {}

  async create(
    id: string,
    createPostDto: CreatePostDto,
    photos: Express.Multer.File[],
  ) {
    try {
      const user = await this.userMinoristaRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!user) throw new BadRequestException('User not found');

      const images = [];

      if (photos.length > 0) {
        const imagesUrl = await this.s3Service.uploadFiles(photos);

        imagesUrl.forEach((url) => {
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

      /**
       * Aquí se va a agregar el envio de correo para los que hayan agregado al usuario como favorito
       */

      await this.postRepository.save(post);

      const emailsFavorites =
        await this.favoritesService.getEmailsForSendNotification(user.id);

      await this.emailService.sendEmailNotificacion(
        emailsFavorites,
        `
        <p>El usuario ${
          user.user.fullName
        } ha realizado una nueva publicación!!!</p>
        <p>Título de la publicación <strong>${createPostDto.title.toUpperCase()}</strong></p>
        <p>Ve a darle un vistazo!!!</p>
        `,
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Post was successfuly created',
      };
    } catch (error) {
      this.logger.error(`Ocurrió un eror al crear el post ${error}`);
      throw new NotFoundException(error.message);
    }
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { images: true, opinions: true },
    });

    if (!post) throw new NotFoundException();

    delete post.updatedAt;

    post.images.forEach((image) => {
      delete image.id;
      delete image.createdAt;
      delete image.updatedAt;
    });

    return post;
  }

  async findAll() {
    const posts = await this.postRepository.find({
      relations: { images: true, user: true },
      order: { createdAt: 'DESC' },
    });

    posts.forEach((post) => delete post.updatedAt);

    const results = posts.map(async (post) => {
      const { images, user, ...rest } = post;
      const u = await this.userService.findOne(user.id);

      return {
        ...rest,
        user: { ...user, score: u.score },
        images: images.map((image) => image.url),
      };
    });

    return await Promise.all(results);
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

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    photos: Express.Multer.File[],
  ) {
    const postDB = await this.findOne(id);

    if (!postDB) throw new BadRequestException();

    Object.assign(postDB, updatePostDto);

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
        postDB.images = images;
      }

      // intenta guardar
      await queryRunner.manager.save(postDB);
      // hace el commit de la transaccion
      await queryRunner.commitTransaction();
      // desconecta el queryRunner
      await queryRunner.release();

      return {
        status: HttpStatus.OK,
        message: 'Post was successfuly updated',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.logger.error(`Ocurrió un error al actualizar el post ${error}`);
    }
  }

  async remove(id: string) {
    const post = await this.findOne(id);

    if (!post) throw new BadRequestException();

    try {
      await this.postRepository.remove(post);

      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Post was successfuly deleted',
      };
    } catch (error) {
      this.logger.error(`Ocurrió un error al eliminar el post ${error}`);
    }
  }

  async getCatalogo(ocupacion: catalogEnum) {
    this.logger.log(`Obteniendo catalogo ${ocupacion}`);
    const posts = await this.postRepository.find({
      relations: { images: true, user: true },
      where: { user: { ocupacion } },
    });

    posts.forEach((post) => delete post.updatedAt);

    const results = posts.map(async (post) => {
      const { images, user, ...rest } = post;
      const u = await this.userService.findOne(user.id);

      return {
        ...rest,
        user: { ...user, score: u.score },
        images: images.map((image) => image.url),
      };
    });

    return await Promise.all(results);
  }
}
