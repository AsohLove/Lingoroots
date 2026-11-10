import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LanguageService } from './language.service.js';

@ApiTags('Languages')
@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all languages',
  })
  @ApiOkResponse({
    description: 'Languages retrieved successfully',
  })
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':languageId/variants')
  @ApiOperation({
    summary: 'Get variants belonging to a language',
  })
  @ApiOkResponse({
    description: 'Language variants retrieved successfully',
  })
  findVariants(@Param('languageId') languageId: string) {
    return this.languageService.findVariants(languageId);
  }
}