import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateOpinionDto {
  @IsString()
  @IsOptional()
  content: string;

  @IsArray()
  @IsOptional()
  photos: string;
}
