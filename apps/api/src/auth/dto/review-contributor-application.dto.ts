import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ContributorApplicationDecision } from '../../generated/prisma/client.js';

export class ReviewContributorApplicationDto {
  @IsEnum(ContributorApplicationDecision)
  decision!: ContributorApplicationDecision;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  comment!: string;
}