import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateContributorApplicationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  languageId?: string;

  @IsOptional()
  @IsString()
  variantId?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(30)
  @MaxLength(5000)
  expertiseStatement?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  evidenceUrls?: string[];
}