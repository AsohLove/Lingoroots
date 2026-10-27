import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UnitService } from './unit.service.js';

@ApiTags('Unit')
@Controller('levels/:levelId/units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @ApiOperation({
    summary: 'Get units for a level',
  })
  @ApiParam({
    name: 'levelId',
    description: 'ID of the level',
  })
  @ApiOkResponse({
    description: 'Units retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Level was not found',
  })
  findByLevel(@Param('levelId') levelId: string) {
    return this.unitService.findByLevel(levelId);
  }
}