import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LanguageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.language.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findVariants(languageId: string) {
    const language = await this.prisma.language.findUnique({
      where: { id: languageId },
      select: { id: true },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    return this.prisma.variant.findMany({
      where: { languageId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        languageId: true,
        name: true,
        description: true,
      },
    });
  }
}