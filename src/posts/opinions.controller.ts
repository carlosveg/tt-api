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
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { OpinionsService } from './opinions.service';

@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post('/create/:id')
  @UseInterceptors(FilesInterceptor('photos'))
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createOpinionDto: CreateOpinionDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.opinionsService.create(id, createOpinionDto, photos);
  }

  @Get()
  findAll() {
    return this.opinionsService.findAll();
  }

  @Get('/user')
  findAllByUser(@Query('id') id: string) {
    return this.opinionsService.findAllByUser(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('photos'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.opinionsService.update(id, updatePostDto, photos);
  }

  /* @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    console.log('entra');
    return this.opinionsService.remove(id);
  } */
}
