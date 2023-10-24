import { IsArray, IsString } from 'class-validator';

export class CreateOpinionDto {
  @IsString()
  content: string;

  @IsArray()
  photos: string;
}
