import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UnitService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLevel(levelId: string) {
    return this.prisma.unit.findMany({
      where: {
        levelId,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}