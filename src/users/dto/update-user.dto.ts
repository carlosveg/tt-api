import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @MinLength(18)
  @MaxLength(18)
  curp?: string;
  @IsString()
  name?: string;
  @IsString()
  apPat?: string;
  @IsString()
  apMat?: string;
  @IsString()
  email?: string;
  @IsString()
  password?: string;
  @IsString()
  @IsPhoneNumber('MX')
  phone?: string;
  @IsNumber()
  @IsOptional()
  @IsIn([0, 1, 2])
  userType?: number;
}
