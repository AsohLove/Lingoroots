import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from './language.service.js';

describe('LanguageService', () => {
  let service: LanguageService;

  const prisma = {
    language: {
      findMany: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LanguageService(prisma as any);
  });

  it('should return languages ordered by name', async () => {
    const languages = [
      {
        id: '1',
        name: 'Ewondo',
        description: 'A Cameroonian language',
      },
    ];

    prisma.language.findMany.mockResolvedValue(languages);

    const result = await service.findAll();

    expect(result).toEqual(languages);

    expect(prisma.language.findMany).toHaveBeenCalledWith({
      orderBy: {
        name: 'asc',
      },
    });
  });
});