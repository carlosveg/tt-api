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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly minoristaService: MinoristaService,
    private readonly favoritesService: FavoritesService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('minoristas')
  findAllMinoristas() {
    return this.minoristaService.findAllMinoristas();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  // @Auth()
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.usersService.update(id, updateUserDto, photo);
  }

  @Delete(':id')
  // @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  /* 
  Favorites section
  */
  @Get('favorites/:id')
  // @Auth()
  getFavoritesByUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.favoritesService.getFavoritesByUser(id);
  }

  @Post('favorites/:id/:idFav')
  // @Auth()
  addFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('idFav', ParseUUIDPipe) idFav: string,
  ) {
    return this.favoritesService.addFavorite(id, idFav);
  }

  @Delete('favorites/:id/:idFav')
  // @Auth()
  deleteFavoriteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('idFav', ParseUUIDPipe) idFav: string,
  ) {
    return this.favoritesService.removeFavorite(id, idFav);
  }

  // DEPRECATED
  @Post('create/minorista/:id')
  // @Auth()
  createMinorista(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() minoristaDto: MinoristaDto,
  ) {
    return this.minoristaService.createMinorista(id, minoristaDto);
  }

  @Post('accept-solicitud-minorista/:idSolicitud')
  createSolicitudMinorista(@Param('id', ParseUUIDPipe) id: string) {
    return this.minoristaService.createSolicitudMinorista(id);
  }

  @Post('accept-solicitud-minorista/:id')
  acceptSolicitudMinorista(@Param('id', ParseUUIDPipe) id: string) {
    return this.minoristaService.acceptSolicitudMinorista(id);
  }
}
