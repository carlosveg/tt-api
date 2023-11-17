import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('post/:imageName')
  findPostImage(
    @Res() res: Response,
    @Param('imageName')
    imageName: string,
  ) {
    const path = this.filesService.getStaticPostImage(imageName);

    res.sendFile(path);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      /* limits: { fileSize: 1000  }, */
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('Measure that the file is an image');

    const secureUrl = `${this.configService.get('HOST_API')}/files/post/${
      file.filename
    }`;

    return { secureUrl };
  }
}
