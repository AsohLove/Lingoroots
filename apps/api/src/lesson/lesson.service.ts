import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUnit(unitId: string) {
    return this.prisma.lesson.findMany({
      where: {
        unitId,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}