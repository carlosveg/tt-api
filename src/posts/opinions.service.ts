import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/posts/entities/image.entity';
import { User, UserMinorista } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { DataSource, Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Opinion } from './entities/opinion.entity';
import { Post } from './entities/post.entity';

@Injectable()
export class OpinionsService {
  private readonly logger = new Logger(OpinionsService.name);

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
    createOpinionDto: CreateOpinionDto,
    photos: Express.Multer.File[],
  ) {
    const postDB = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!postDB) throw new NotFoundException('Post not found');

    let user: User | UserMinorista = await this.userService.findOne(
      postDB.user.id,
    );

    if (user instanceof UserMinorista) {
      user = await this.userMinoristaRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      user = user.user;
    }

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

      const opinion = this.opinionRepository.create({
        ...createOpinionDto,
        user,
        images,
        post: postDB,
      });

      await this.opinionRepository.save(opinion);

      return opinion;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async findOne(id: string) {
    const post = await this.opinionRepository.findOneBy({ id });

    if (!post) throw new BadRequestException();

    return post;
  }

  async findAll() {
    const opinions = await this.opinionRepository.find({
      relations: { images: true, user: true },
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

  /* async remove(id: string) {
    const post = await this.findOne(id);

    if (!post) throw new BadRequestException();

    await this.postRepository.remove(post);

    return {
      status: HttpStatus.NO_CONTENT,
      message: 'Post was successfuly deleted',
    };
  } */
}
