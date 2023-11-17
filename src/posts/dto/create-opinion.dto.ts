import { IsArray, IsOptional, IsString } from 'class-validator';
import { Image } from '../entities/image.entity';

export class CreateOpinionDto {
  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  photos?: Image[];
}
