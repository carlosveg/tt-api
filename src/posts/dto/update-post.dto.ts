import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsArray, IsString } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsString({ each: true })
  @IsArray()
  images?: string[];

  @IsString()
  user?: string;
}
