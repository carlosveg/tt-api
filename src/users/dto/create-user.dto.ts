import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @MinLength(18)
  @MaxLength(18)
  curp: string;

  @IsString()
  fullName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @IsString()
  @IsPhoneNumber('MX')
  phone: string;

  @IsString()
  @IsOptional()
  urlImgProfile?: string;
}
