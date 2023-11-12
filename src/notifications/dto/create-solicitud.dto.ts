import { IsEnum, IsOptional, IsString } from 'class-validator';
import { catalogEnum } from '../../common/enum';

export class CreateSolicitudDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsEnum(catalogEnum)
  ocupacion: catalogEnum;

  @IsString()
  description: string;

  @IsString()
  latitud: string;

  @IsString()
  longitud: string;
}
