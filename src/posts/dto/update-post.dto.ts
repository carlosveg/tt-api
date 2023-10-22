import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsArray, IsString } from 'class-validator';
import { Image } from '../entities/image.entity';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  // @IsArray()
  // images?: Image[];
}
