import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonService } from './lesson.service.js';

describe('LessonService', () => {
  let service: LessonService;

  const prisma = {
    lesson: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LessonService(prisma as any);
  });

  it('should return lessons for a unit ordered by order', async () => {
    const lessons = [
      {
        id: 'lesson-1',
        unitId: 'unit-1',
        name: 'Basic Greetings',
        description: 'Learn common greetings.',
        order: 1,
      },
    ];

    prisma.lesson.findMany.mockResolvedValue(lessons);

    const result = await service.findByUnit('unit-1');

    expect(result).toEqual(lessons);

    expect(prisma.lesson.findMany).toHaveBeenCalledWith({
      where: {
        unitId: 'unit-1',
      },
      orderBy: {
        order: 'asc',
      },
    });
  });

  it('should return lesson content ordered within each content type', async () => {
    const lessonContent = {
      id: 'lesson-1',
      unitId: 'unit-1',
      name: 'Basic Greetings',
      description: 'Learn common greetings.',
      order: 1,
      vocabularyItems: [],
      expressions: [],
      exampleSentences: [],
      audio: [],
    };

    prisma.lesson.findUnique.mockResolvedValue(lessonContent);

    const result = await service.findContentByLesson('lesson-1');

    expect(result).toEqual(lessonContent);

    expect(prisma.lesson.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'lesson-1',
      },
      include: {
        vocabularyItems: {
          orderBy: {
            order: 'asc',
          },
        },
        expressions: {
          orderBy: {
            order: 'asc',
          },
        },
        exampleSentences: {
          orderBy: {
            order: 'asc',
          },
        },
        audio: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  });
});