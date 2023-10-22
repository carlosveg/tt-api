import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUser, RawHeaders } from './decorators';
import { Auth } from './decorators/auth.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from '../users/dto';
import { UserRoleGuard } from './guargs/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { User } from 'src/users/entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @UploadedFile() photo: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.authService.create(createUserDto, photo);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() headers: string[],
  ) {
    return { user, email, headers };
  }

  @Get('private2')
  //@SetMetadata('roles', ['admin', 'su'])
  @RoleProtected(ValidRoles.su, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testPrivateRoute2(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() headers: string,
  ) {
    return { user, email, headers, message: 'Ha accesado a la ruta privada' };
  }

  @Get('private3')
  //@SetMetadata('roles', ['admin', 'su'])
  @Auth()
  testPrivateRoute3(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() headers: string,
  ) {
    return { user, email, headers };
  }
}
