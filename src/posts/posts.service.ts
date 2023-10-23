import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/posts/entities/image.entity';
import { UserMinorista } from 'src/users/entities';
import { UsersService } from 'src/users/services/users.service';
import { DataSource, Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { Opinion } from './entities/opinion.entity';

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
  ) {}

  async create(
    id: string,
    createPostDto: CreatePostDto,
    photos: Express.Multer.File[],
  ) {
    try {
      /*
        Buscamos que el curp que manden en el Body esté registrado
        para asociarlo al post
      */
      const user = await this.userMinoristaRepository.findOne({
        where: { id },
      });

      if (!user) throw new BadRequestException('User not found');

      const images = [];

      if (photos.length > 0) {
        const imagesUrl = await this.s3Service.uploadFiles(photos);
        imagesUrl.forEach((url) => {
          const image = this.imageRepository.create({ url });
          images.push(image);
        });
      }

      await this.imageRepository.save(images);

      const post = this.postRepository.create({
        ...createPostDto,
        user,
        images,
      });

      await this.postRepository.save(post);

      return post;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(error.message);
    }
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { images: true, opinions: true },
    });

    if (!post) throw new NotFoundException();

    return post;
  }

  async findAll() {
    const posts = await this.postRepository.find({
      relations: { images: true, user: true },
      order: { createdAt: 'DESC' },
    });

    return posts.map((post) => {
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
      const images = [];
      if (photos.length > 0) {
        const imagesUrl = await this.s3Service.uploadFiles(photos);
        imagesUrl.forEach((url) => {
          const image = this.imageRepository.create({ url });
          images.push(image);
        });
      }

      await this.imageRepository.save(images);

      postDB.images = images;

      // intenta guardar
      await queryRunner.manager.save(postDB);
      // hace el commit de la transaccion
      await queryRunner.commitTransaction();
      // desconecta el queryRunner
      await queryRunner.release();

      return postDB;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      console.log(error);
      this.logger.error(error);
    }
  }

  async remove(id: string) {
    const post = await this.findOne(id);

    if (!post) throw new BadRequestException();

    try {
      // for (const image of post.images) await this.imageRepository.remove(image);
      // for (const opinion of post.opinions)
      //   await this.opinionRepository.remove(opinion);

      await this.postRepository.remove(post);

      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Post was successfuly deleted',
      };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
