import { IsEnum, IsString } from 'class-validator';
import { catalogEnum } from 'src/common/enum';

export class MinoristaDto {
  @IsEnum({ enum: catalogEnum })
  ocupacion: catalogEnum;

  @IsString()
  latitud: string;

  @IsString()
  longitud: string;
}
