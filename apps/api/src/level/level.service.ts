import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LevelService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.level.findMany({
      where: {
        courseId,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}