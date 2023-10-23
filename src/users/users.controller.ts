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
import { UsersService } from './services/users.service';
import { MinoristaService } from './services/minorista.service';
import { FavoritesService } from './services/favorites.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly minoristaService: MinoristaService,
    private readonly favoritesService: FavoritesService,
  ) {}

  /* Deprecated */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
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

  @Post('favorites/:id/:favId')
  addFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('favId', ParseUUIDPipe) favId: string,
  ) {
    return this.favoritesService.addFavorite(id, favId);
  }

  @Delete('favorites/:id/:favId')
  deleteFavoriteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('favId', ParseUUIDPipe) favId: string,
  ) {
    return this.favoritesService.removeFavorite(id, favId);
  }

  @Get('/minoristas')
  findAllMinoristas() {
    return this.minoristaService.findAllMinoristas();
  }

  @Post('create/minorista/:id')
  createMinorista(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() minoristaDto: MinoristaDto,
  ) {
    return this.minoristaService.createMinorista(id, minoristaDto);
  }
}
