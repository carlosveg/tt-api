import { IsString } from 'class-validator';

export class CreateOpinionDto {
  @IsString()
  content: string;
}
