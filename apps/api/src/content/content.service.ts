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
import { ReviewVocabularyDto } from './dto/review-vocabulary.dto.js';

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

  async getSubmittedVocabulary(user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'REVIEWER');

    return this.prisma.vocabularyItem.findMany({
      where: {
        status: 'SUBMITTED',
        createdById: {
          not: user.id,
        },
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
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async startVocabularyReview(vocabularyId: string, user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'REVIEWER');

    const vocabulary = await this.prisma.vocabularyItem.findUnique({
      where: {
        id: vocabularyId,
      },
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary item not found');
    }

    if (vocabulary.createdById === user.id) {
      throw new ForbiddenException('You cannot review your own content');
    }

    if (vocabulary.status !== 'SUBMITTED') {
      throw new ForbiddenException('Only submitted content can enter review');
    }

    return this.prisma.vocabularyItem.update({
      where: {
        id: vocabularyId,
      },
      data: {
        status: 'UNDER_REVIEW',
      },
    });
  }
  async approveVocabulary(
    vocabularyId: string,
    user: AuthenticatedUser,
    dto: ReviewVocabularyDto,
  ) {
    this.authorizationService.requireRole(user, 'REVIEWER');

    const vocabulary = await this.prisma.vocabularyItem.findUnique({
      where: {
        id: vocabularyId,
      },
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary item not found');
    }

    if (vocabulary.createdById === user.id) {
      throw new ForbiddenException('You cannot review your own content');
    }

    if (vocabulary.status !== 'UNDER_REVIEW') {
      throw new ForbiddenException('Vocabulary must be under review');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vocabularyItem.update({
        where: {
          id: vocabularyId,
        },
        data: {
          status: 'PUBLISHED',
        },
      });

      await tx.contentReview.create({
        data: {
          vocabularyId,
          reviewerId: user.id,
          status: 'APPROVED',
          comment: dto.comment,
        },
      });

      return updated;
    });
  }
  async requestVocabularyChanges(
    vocabularyId: string,
    user: AuthenticatedUser,
    dto: ReviewVocabularyDto,
  ) {
    this.authorizationService.requireRole(user, 'REVIEWER');

    if (!dto.comment) {
      throw new ForbiddenException(
        'A comment is required when requesting changes',
      );
    }

    const vocabulary = await this.prisma.vocabularyItem.findUnique({
      where: {
        id: vocabularyId,
      },
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary item not found');
    }

    if (vocabulary.createdById === user.id) {
      throw new ForbiddenException('You cannot review your own content');
    }

    if (vocabulary.status !== 'UNDER_REVIEW') {
      throw new ForbiddenException('Vocabulary must be under review');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vocabularyItem.update({
        where: {
          id: vocabularyId,
        },
        data: {
          status: 'CHANGES_REQUESTED',
        },
      });

      await tx.contentReview.create({
        data: {
          vocabularyId,
          reviewerId: user.id,
          status: 'CHANGES_REQUESTED',
          comment: dto.comment,
        },
      });

      return updated;
    });
  }

  async rejectVocabulary(
  vocabularyId: string,
  user: AuthenticatedUser,
  dto: ReviewVocabularyDto,
) {
  this.authorizationService.requireRole(user, 'REVIEWER');

  if (!dto.comment) {
    throw new ForbiddenException(
      'A comment is required when rejecting content',
    );
  }

  const vocabulary = await this.prisma.vocabularyItem.findUnique({
    where: {
      id: vocabularyId,
    },
  });

  if (!vocabulary) {
    throw new NotFoundException('Vocabulary item not found');
  }

  if (vocabulary.createdById === user.id) {
    throw new ForbiddenException('You cannot review your own content');
  }

  if (vocabulary.status !== 'UNDER_REVIEW') {
    throw new ForbiddenException('Vocabulary must be under review');
  }

  return this.prisma.$transaction(async (tx) => {
    const updated = await tx.vocabularyItem.update({
      where: {
        id: vocabularyId,
      },
      data: {
        status: 'REJECTED',
      },
    });

    await tx.contentReview.create({
      data: {
        vocabularyId,
        reviewerId: user.id,
        status: 'REJECTED',
        comment: dto.comment,
      },
    });

    return updated;
  });
}
}