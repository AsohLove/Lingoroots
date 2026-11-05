import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async startLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson was not found');
    }

    return this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        status: 'IN_PROGRESS',
      },
      // Starting an already completed lesson must not reset it.
      update: {},
    });
  }

  async getSummary(userId: string) {
    const progress = await this.prisma.lessonProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            name: true,
            order: true,
            unit: {
              select: {
                id: true,
                name: true,
                level: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    course: {
                      select: {
                        id: true,
                        name: true,
                        language: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const completed = progress.filter(
      (item) => item.status === 'COMPLETED',
    ).length;

    return {
      totalStarted: progress.length,
      totalCompleted: completed,
      totalInProgress: progress.length - completed,
      lessons: progress,
    };
  }

  async getLessonProgress(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson was not found');
    }

    return this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
  }
}