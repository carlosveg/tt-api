import { IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(18)
  @MaxLength(18)
  curp: string;

  @IsString()
  name: string;

  @IsString()
  apPat: string;

  @IsString()
  apMat: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsPhoneNumber('MX')
  phone: string;

  /* @IsString()
  @IsOptional()
  @IsIn(['0', '1', '2'])
  userType?: number; */

  @IsString()
  urlImgProfile: string;
}
