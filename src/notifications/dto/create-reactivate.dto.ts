import { IsEnum, IsOptional, IsString } from 'class-validator';
import { catalogEnum } from '../../common/enum';

export class CreateSolicitudDto {
  @IsString()
  @IsEnum(catalogEnum)
  ocupacion: catalogEnum;

  @IsString()
  latitud: string;

  @IsString()
  longitud: string;
}
