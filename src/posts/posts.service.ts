import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UsersService } from 'src/users/users.service';
import { Repository, DataSource } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostImage } from './entities/post-image.entity';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    private readonly userService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      const { images = [], user, ...postDetails } = createPostDto;

      /*
        Buscamos que el curp que manden en el Body esté registrado
        para asociarlo al post
      */
      const userExists = await this.userService.findOne(user);

      if (!userExists) throw new BadRequestException();

      const post = this.postRepository.create({
        ...postDetails,
        images: images.map((image) =>
          this.postImageRepository.create({ url: image }),
        ),
        user: userExists,
      });

      await this.postRepository.save(post);

      return post;
    } catch (error) {
      console.log(error);
    }
    return 'This action adds a new post';
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) throw new BadRequestException();

    return post;
  }

  async findAllByUser(id: string) {
    const posts = await this.postRepository.find({
      where: { user: { curp: id } },
      relations: { user: true, images: true },
    });

    return posts.map((post) => ({
      ...post,
      user: post.user.curp,
      images: post.images.map((image) => image.url),
    }));
  }

  async findSome(paginationDto: PaginationDto, id: string) {
    const { limit = 10, offset = 0 } = paginationDto;
    const posts = await this.postRepository.find({
      where: { user: { curp: id } },
      take: limit,
      skip: offset,
      relations: { user: true, images: true },
    });

    return posts.map((post) => ({
      ...post,
      user: post.user.curp,
      images: post.images.map((image) => image.url),
    }));
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const { images, ...toUpdate } = updatePostDto;
    const postDB = await this.findOne(id);

    if (!postDB) throw new BadRequestException();

    // const post = await this.postRepository.preload({
    //   ...postDB,
    //   ...toUpdate,
    // });

    Object.assign(postDB, toUpdate);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images.length > 0) {
        await queryRunner.manager.delete(PostImage, { post: { id } });

        postDB.images = images.map((image) =>
          this.postImageRepository.create({ url: image }),
        );
      }

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
    }
  }

  async remove(id: string) {
    const post = await this.findOne(id);

    if (!post) throw new BadRequestException();

    await this.postRepository.remove(post);
  }
}
