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
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('/create/:id')
  @UseInterceptors(FilesInterceptor('photos'))
  create(
    @Param('id') id: string,
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

  @Get('/user')
  findAllByUser(@Query('id') id: string) {
    return this.postsService.findAllByUser(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('photos'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.postsService.update(id, updatePostDto, photos);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}
