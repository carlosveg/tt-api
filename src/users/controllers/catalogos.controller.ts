import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../../auth/decorators';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { MinoristaDto } from '../dto/minorista.dto';
import { UsersService } from '../services';
import { FavoritesService } from '../services/favorites.service';
import { MinoristaService } from '../services/minorista.service';
import { ScoreDto } from '../dto/score.dto';
import { ScoresService } from '../services/scores.service';
import { CatalogoService } from '../services/catalogos.service';
import { catalogEnum } from '../../common/enum';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('/:catalogo')
  findOne(@Param('catalogo') catalogo: catalogEnum) {
    return this.catalogoService.getCatalogo(catalogo);
  }
}
