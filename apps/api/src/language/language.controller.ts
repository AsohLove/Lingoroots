import { Controller, Get } from '@nestjs/common';
import { LanguageService } from './language.service.js';

@Controller('languages')
export class LanguageController {
    constructor(private readonly languageService: LanguageService) {}

    @Get()
    findAll() {
        return this.languageService.findAll();
    }
}
