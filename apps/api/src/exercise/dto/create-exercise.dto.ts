import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { ExerciseType } from '../../generated/prisma/client.js';

export class ExerciseOptionDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateExerciseDto {
  @IsEnum(ExerciseType)
  type!: ExerciseType;

  @IsString()
  @MinLength(1)
  prompt!: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseOptionDto)
  options?: ExerciseOptionDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateIf((o) => o.type === 'TEXT_INPUT')
  @IsString({ each: true })
  acceptedAnswers?: string[];
}