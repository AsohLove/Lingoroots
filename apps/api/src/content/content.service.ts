import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { AuthorizationService } from '../auth/authorization.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { CreateVocabularyDto } from './dto/create-vocabulary.dto.js';
import type { UpdateVocabularyDto } from './dto/update-vocabulary.dto.js';
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

    await this.authorizationService.requireCourseAccess(
      user.id,
      lesson.unit.level.course.languageId,
      lesson.unit.level.course.variantId,
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

    const publishedItems = await this.prisma.vocabularyItem.findMany({
      where: {
        lessonId,
        status: 'PUBLISHED',
      },
      orderBy: [
        {
          versionGroupId: 'asc',
        },
        {
          version: 'desc',
        },
      ],
    });

    // Keep only the newest published version in each group.
    const latestByGroup = new Map<string, (typeof publishedItems)[number]>();

    for (const item of publishedItems) {
      if (!latestByGroup.has(item.versionGroupId)) {
        latestByGroup.set(item.versionGroupId, item);
      }
    }

    // Preserve the lesson's display order.
    return Array.from(latestByGroup.values()).sort((a, b) => a.order - b.order);
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

    await this.authorizationService.requireCourseAccess(
      user.id,
      vocabulary.lesson.unit.level.course.languageId,
      vocabulary.lesson.unit.level.course.variantId,
    );

    return this.prisma.vocabularyItem.update({
      where: {
        id: vocabularyId,
      },
      data: dto,
    });
  }

  async createVocabularyVersion(vocabularyId: string, user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const vocabulary = await this.prisma.vocabularyItem.findUnique({
      where: { id: vocabularyId },
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
        'You can only create versions of your own vocabulary',
      );
    }

    if (vocabulary.status !== 'PUBLISHED') {
      throw new ConflictException('Only published vocabulary can be versioned');
    }

    await this.authorizationService.requireCourseAccess(
      user.id,
      vocabulary.lesson.unit.level.course.languageId,
      vocabulary.lesson.unit.level.course.variantId,
    );

    const latestVersion = await this.prisma.vocabularyItem.findFirst({
      where: {
        versionGroupId: vocabulary.versionGroupId,
      },
      orderBy: {
        version: 'desc',
      },
    });

    if (!latestVersion || latestVersion.id !== vocabulary.id) {
      throw new ConflictException(
        'A newer version of this vocabulary already exists',
      );
    }

    return this.prisma.vocabularyItem.create({
      data: {
        lessonId: vocabulary.lessonId,
        createdById: user.id,
        term: vocabulary.term,
        meaning: vocabulary.meaning,
        explanation: vocabulary.explanation,
        order: vocabulary.order,
        versionGroupId: vocabulary.versionGroupId,
        version: vocabulary.version + 1,
        status: 'DRAFT',
      },
    });
  }

  async submitVocabulary(vocabularyId: string, user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const vocabulary = await this.prisma.vocabularyItem.findUnique({
      where: { id: vocabularyId },
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
      throw new ForbiddenException('You can only submit your own vocabulary');
    }

    if (
      vocabulary.status !== 'DRAFT' &&
      vocabulary.status !== 'CHANGES_REQUESTED'
    ) {
      throw new ForbiddenException('Only draft content can be submitted');
    }

    const course = vocabulary.lesson.unit.level.course;

    await this.authorizationService.requireCourseAccess(
      user.id,
      course.languageId,
      course.variantId,
    );

    return this.prisma.vocabularyItem.update({
      where: { id: vocabularyId },
      data: {
        status: 'SUBMITTED',
      },
    });
  }

  async getSubmittedVocabulary(user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'REVIEWER');

    return this.prisma.vocabularyItem.findMany({
      where: {
        createdById: {
          not: user.id,
        },
        OR: [
          {
            status: 'SUBMITTED',
          },
          {
            status: 'UNDER_REVIEW',
            reviews: {
              some: {
                reviewerId: user.id,
                status: 'UNDER_REVIEW',
              },
            },
          },
        ],
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

    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.vocabularyItem.updateMany({
        where: {
          id: vocabularyId,
          status: 'SUBMITTED',
        },
        data: {
          status: 'UNDER_REVIEW',
        },
      });

      if (claimed.count !== 1) {
        throw new ConflictException(
          'This vocabulary is no longer available for review',
        );
      }

      await tx.contentReview.create({
        data: {
          vocabularyId,
          reviewerId: user.id,
          status: 'UNDER_REVIEW',
        },
      });

      return tx.vocabularyItem.findUniqueOrThrow({
        where: {
          id: vocabularyId,
        },
      });
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

    const activeReview = await this.prisma.contentReview.findFirst({
      where: {
        vocabularyId,
        reviewerId: user.id,
        status: 'UNDER_REVIEW',
      },
    });

    if (!activeReview) {
      throw new ForbiddenException(
        'You do not own the active review for this content',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vocabularyItem.update({
        where: {
          id: vocabularyId,
        },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      await tx.contentReview.update({
        where: {
          id: activeReview.id,
        },
        data: {
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

    if (!dto.comment?.trim()) {
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

    const activeReview = await this.prisma.contentReview.findFirst({
      where: {
        vocabularyId,
        reviewerId: user.id,
        status: 'UNDER_REVIEW',
      },
    });

    if (!activeReview) {
      throw new ForbiddenException(
        'You do not own the active review for this content',
      );
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

      await tx.contentReview.update({
        where: {
          id: activeReview.id,
        },
        data: {
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

    if (!dto.comment?.trim()) {
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

    const activeReview = await this.prisma.contentReview.findFirst({
      where: {
        vocabularyId,
        reviewerId: user.id,
        status: 'UNDER_REVIEW',
      },
    });

    if (!activeReview) {
      throw new ForbiddenException(
        'You do not own the active review for this content',
      );
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

      await tx.contentReview.update({
        where: {
          id: activeReview.id,
        },
        data: {
          status: 'REJECTED',
          comment: dto.comment,
        },
      });

      return updated;
    });
  }
}
