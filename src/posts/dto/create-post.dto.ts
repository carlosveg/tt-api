import { IsArray, IsOptional, IsString } from 'class-validator';
import { Image } from '../entities/image.entity';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  images?: Image[];
}
