import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseService } from './course.service.js';

describe('CourseService', () => {
  let service: CourseService;

  const prisma = {
    course: {
      findMany: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CourseService(prisma as any);
  });

  it('should return courses for a language ordered by name', async () => {
    const courses = [
      {
        id: '1',
        languageId: 'language-1',
        name: 'General Ewondo',
        description: 'A structured course for learning Ewondo.',
      },
    ];

    prisma.course.findMany.mockResolvedValue(courses);

    const result = await service.findByLanguage('language-1');

    expect(result).toEqual(courses);

    expect(prisma.course.findMany).toHaveBeenCalledWith({
      where: {
        languageId: 'language-1',
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
  });
});
