import { Controller, Get } from '@nestjs/common';
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
}