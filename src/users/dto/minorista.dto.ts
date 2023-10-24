import { IsEnum, IsString } from 'class-validator';
import { UserTypeEnum } from 'src/common/enum';

export class MinoristaDto {
  @IsString()
  ocupacion: string;

  @IsString()
  direccion_negocio: string;

  /* @IsEnum(UserTypeEnum)
  type: UserTypeEnum; */
}
