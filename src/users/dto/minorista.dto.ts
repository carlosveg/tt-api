import { IsString } from 'class-validator';

export class MinoristaDto {
  @IsString()
  ocupacion: string;

  @IsString()
  direccion_negocio: string;

  /* @IsEnum(UserTypeEnum)
  type: UserTypeEnum; */
}
