import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './services/posts.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('/create/:id')
  // @Auth(ValidRoles.MINORISTA)
  @UseInterceptors(FilesInterceptor('photos'))
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.postsService.create(id, createPostDto, photos);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Get('/user/:id')
  findAllByUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findAllByUser(id);
  }

  @Patch(':id')
  // @Auth(ValidRoles.MINORISTA)
  @UseInterceptors(FilesInterceptor('photos'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.postsService.update(id, updatePostDto, photos);
  }

  @Delete(':id')
  // @Auth(ValidRoles.MINORISTA)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}
