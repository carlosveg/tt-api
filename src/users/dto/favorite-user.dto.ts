import { IsString } from 'class-validator';

export class FavoriteUserDto {
  @IsString()
  curp: string;

  @IsString()
  fullName: string;

  @IsString()
  urlImgProfile: string;
}
