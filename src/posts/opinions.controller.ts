import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { OpinionsService } from './services/opinions.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('opinions')
export class OpinionsController {
  constructor(private readonly opinionsService: OpinionsService) {}

  @Post('/create/:id')
  // @Auth()
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

  @Get('/user/:id')
  findAllByUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.opinionsService.findAllByUser(id);
  }

  @Get('/post/:id')
  findAllByPost(@Param('id', ParseUUIDPipe) id: string) {
    return this.opinionsService.findAllByPost(id);
  }

  @Patch('/post/:id')
  // @Auth()
  @UseInterceptors(FilesInterceptor('photos'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOpinionDto: UpdateOpinionDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.opinionsService.update(id, updateOpinionDto, photos);
  }

  @Delete(':id')
  // @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.opinionsService.remove(id);
  }
}
