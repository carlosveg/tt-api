import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Image } from '../entities/image.entity';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  images?: Image[];
}
