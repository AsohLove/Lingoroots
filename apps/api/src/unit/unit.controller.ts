import { Controller, Get, Param } from '@nestjs/common';
import { UnitService } from './unit.service.js';

@Controller('levels/:levelId/units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  findByLevel(@Param('levelId') levelId: string) {
    return this.unitService.findByLevel(levelId);
  }
}