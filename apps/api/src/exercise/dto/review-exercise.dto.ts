import { IsOptional, IsString, MinLength } from 'class-validator';

export class ReviewExerciseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  comment?: string;
}