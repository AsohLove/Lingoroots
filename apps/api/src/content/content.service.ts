import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { AuthorizationService } from '../auth/authorization.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateVocabularyDto,
} from './dto/create-vocabulary.dto.js';
import type {
  UpdateVocabularyDto,
} from './dto/update-vocabulary.dto.js';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async createVocabulary(
    lessonId: string,
    dto: CreateVocabularyDto,
    user: AuthenticatedUser,
  ) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        unit: {
          include: {
            level: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.authorizationService.requireLanguageAccess(
      user.id,
      lesson.unit.level.course.languageId,
    );

    const existingCount = await this.prisma.vocabularyItem.count({
      where: {
        lessonId,
      },
    });

    return this.prisma.vocabularyItem.create({
      data: {
        lessonId,
        createdById: user.id,
        term: dto.term,
        meaning: dto.meaning,
        explanation: dto.explanation,
        order: dto.order ?? existingCount,
      },
    });
  }

  async getVocabularyForLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.prisma.vocabularyItem.findMany({
      where: {
        lessonId,
        status: 'PUBLISHED',
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async updateVocabulary(
    vocabularyId: string,
    dto: UpdateVocabularyDto,
    user: AuthenticatedUser,
  ) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const vocabulary = await this.prisma.vocabularyItem.findUnique({
      where: {
        id: vocabularyId,
      },
      include: {
        lesson: {
          include: {
            unit: {
              include: {
                level: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary item not found');
    }

    if (vocabulary.createdById !== user.id) {
      throw new ForbiddenException(
        'You can only edit your own vocabulary drafts',
      );
    }

    if (
      vocabulary.status !== 'DRAFT' &&
      vocabulary.status !== 'CHANGES_REQUESTED'
    ) {
      throw new ForbiddenException('Only draft content can be edited');
    }

    await this.authorizationService.requireLanguageAccess(
      user.id,
      vocabulary.lesson.unit.level.course.languageId,
    );

    return this.prisma.vocabularyItem.update({
      where: {
        id: vocabularyId,
      },
      data: dto,
    });
  }
  async submitVocabulary(vocabularyId: string, user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const vocabulary = await this.prisma.vocabularyItem.findUnique({
      where: {
        id: vocabularyId,
      },
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary item not found');
    }

    if (vocabulary.createdById !== user.id) {
      throw new ForbiddenException('You can only submit your own vocabulary');
    }

    if (
      vocabulary.status !== 'DRAFT' &&
      vocabulary.status !== 'CHANGES_REQUESTED'
    ) {
      throw new ForbiddenException('Only draft content can be submitted');
    }

    return this.prisma.vocabularyItem.update({
      where: {
        id: vocabularyId,
      },
      data: {
        status: 'SUBMITTED',
      },
    });
  }
}