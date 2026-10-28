import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateVocabularyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  term?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  meaning?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}