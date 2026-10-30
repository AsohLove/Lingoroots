import { IsOptional, IsString, MinLength } from 'class-validator';

export class ReviewVocabularyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  comment?: string;
}