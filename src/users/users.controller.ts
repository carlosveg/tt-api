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
import { CreateUserDto, UpdateUserDto } from './dto';
import { MinoristaDto } from './dto/minorista.dto';
import { UsersService } from './services';
import { FavoritesService } from './services/favorites.service';
import { MinoristaService } from './services/minorista.service';

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
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.usersService.update(id, updateUserDto, photo);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  /* 
    Favorites section
   */
  @Get('favorites/:id')
  getFavoritesByUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.favoritesService.getFavoritesByUser(id);
  }

  @Post('favorites/:id/:idFav')
  addFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('idFav', ParseUUIDPipe) idFav: string,
  ) {
    return this.favoritesService.addFavorite(id, idFav);
  }

  @Delete('favorites/:id/:idFav')
  deleteFavoriteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('idFav', ParseUUIDPipe) idFav: string,
  ) {
    return this.favoritesService.removeFavorite(id, idFav);
  }

  @Post('create/minorista/:id')
  createMinorista(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() minoristaDto: MinoristaDto,
  ) {
    return this.minoristaService.createMinorista(id, minoristaDto);
  }
}
