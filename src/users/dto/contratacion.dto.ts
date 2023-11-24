import { IsString } from 'class-validator';

export class ContratacionDto {
  @IsString()
  content: string;
}
