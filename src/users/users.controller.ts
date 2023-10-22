import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto, UpdateUserDto } from './dto';
import { MinoristaDto } from './dto/minorista.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/minoristas')
  findAllMinoristas() {
    return this.usersService.findAllMinoristas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.usersService.update(id, updateUserDto, photo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /* 
    Favorites section
   */
  @Get(':id/favorites')
  getFavoritesByUser(@Param('id') id: string) {
    return this.usersService.getFavoritesByUser(id);
  }

  @Post(':id/favorites')
  addFavorite(
    @Param('id') id: string,
    @Body() body: { favoriteUserId: string },
  ) {
    return this.usersService.addFavorite(id, body.favoriteUserId);
  }

  @Delete(':id/favorites')
  deleteFavoriteUser(
    @Param('id') id: string,
    @Body() body: { favoriteUserId: string },
  ) {
    return this.usersService.removeFavorite(id, body.favoriteUserId);
  }

  @Post('create/minorista/:id')
  createMinorista(@Param('id') id: string, @Body() minoristaDto: MinoristaDto) {
    return this.usersService.createMinorista(id, minoristaDto);
  }
}
