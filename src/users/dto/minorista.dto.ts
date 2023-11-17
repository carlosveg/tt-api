import { IsEnum, IsString } from 'class-validator';
import { catalogEnum } from 'src/common/enum';

export class MinoristaDto {
  @IsEnum(catalogEnum)
  ocupacion: catalogEnum;

  @IsString()
  description: string;

  @IsString()
  latitud: string;

  @IsString()
  longitud: string;
}
