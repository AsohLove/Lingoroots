import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnitService } from './unit.service.js';

describe('UnitService', () => {
  let service: UnitService;

  const prisma = {
    unit: {
      findMany: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UnitService(prisma as any);
  });

  it('should return units for a level ordered by order', async () => {
    const units = [
      {
        id: 'unit-1',
        levelId: 'level-1',
        name: 'Greetings',
        description: 'Basic greetings.',
        order: 1,
      },
    ];

    prisma.unit.findMany.mockResolvedValue(units);

    const result = await service.findByLevel('level-1');

    expect(result).toEqual(units);

    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        levelId: 'level-1',
      },
      orderBy: {
        order: 'asc',
      },
    });
  });
});