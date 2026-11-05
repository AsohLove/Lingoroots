import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUnit(unitId: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      select: { id: true },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return this.prisma.lesson.findMany({
      where: { unitId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        unitId: true,
        name: true,
        description: true,
        order: true,
      },
    });
  }

  async findContentByLesson(unitId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        unitId,
      },
      select: {
        id: true,
        unitId: true,
        name: true,
        description: true,
        order: true,

        expressions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            lessonId: true,
            text: true,
            translation: true,
            explanation: true,
            order: true,
          },
        },

        exampleSentences: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            lessonId: true,
            text: true,
            translation: true,
            explanation: true,
            order: true,
          },
        },

        audio: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            lessonId: true,
            title: true,
            url: true,
            order: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found in this unit');
    }

    const publishedItems = await this.prisma.vocabularyItem.findMany({
      where: {
        lessonId,
        status: 'PUBLISHED',
      },
      orderBy: [
        { versionGroupId: 'asc' },
        { version: 'desc' },
      ],
      select: {
        id: true,
        lessonId: true,
        term: true,
        meaning: true,
        explanation: true,
        order: true,
        versionGroupId: true,
      },
    });

    // Select the newest published version of each vocabulary item.
    const latestByGroup = new Map<
      string,
      (typeof publishedItems)[number]
    >();

    for (const item of publishedItems) {
      if (!latestByGroup.has(item.versionGroupId)) {
        latestByGroup.set(item.versionGroupId, item);
      }
    }

    const vocabularyItems = Array.from(latestByGroup.values())
      .sort((a, b) => a.order - b.order)
      .map(({ versionGroupId: _versionGroupId, ...item }) => item);

    return {
      ...lesson,
      vocabularyItems,
    };
  }
}