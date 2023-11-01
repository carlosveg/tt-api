import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto, LoginUserDto } from '../users/dto';
import { User } from '../users/entities';
import { AuthService } from './auth.service';
import { GetUser, RawHeaders } from './decorators';
import { Auth } from './decorators/auth.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { UserRoleGuard } from './guargs/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';

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
  @Auth()
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
  @RoleProtected(ValidRoles.USER)
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
  @Auth(ValidRoles.USER)
  testPrivateRoute3(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() headers: string,
  ) {
    return { user, email, headers };
  }
}
