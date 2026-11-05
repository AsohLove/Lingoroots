import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLanguage(languageId: string) {
    return this.prisma.course.findMany({
      where: {
        languageId,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        levels: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }
}
