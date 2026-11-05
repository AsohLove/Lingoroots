import {
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class SubmitAnswerDto {
  @IsOptional()
  @IsUUID()
  selectedOptionId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  submittedText?: string;
}