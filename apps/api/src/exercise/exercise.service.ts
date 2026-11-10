import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ContentStatus, ExerciseType } from '../generated/prisma/client.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { AuthorizationService } from '../auth/authorization.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';
import { SubmitAnswerDto } from './dto/submit-answer.dto.js';

@Injectable()
export class ExerciseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  private normalizeAnswer(value: string): string {
    return value.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private requireReviewer(user: AuthenticatedUser) {
    if (
      !user.roles.includes('REVIEWER') &&
      !user.roles.includes('ADMINISTRATOR')
    ) {
      throw new ForbiddenException(
        'You do not have permission to review content',
      );
    }
  }

  private async getLessonScope(lessonId: string): Promise<{
    languageId: string;
    variantId: string | null;
  }> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        unit: {
          select: {
            level: {
              select: {
                course: {
                  select: {
                    languageId: true,
                    variantId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson was not found');
    }

    return lesson.unit.level.course;
  }

  private validateExerciseContent(dto: {
    type?: ExerciseType;
    options?: { text: string; isCorrect: boolean; order: number }[];
    acceptedAnswers?: string[];
  }) {
    if (dto.type === ExerciseType.MULTIPLE_CHOICE) {
      if (!dto.options || dto.options.length < 2) {
        throw new BadRequestException(
          'Multiple-choice exercises require at least two options',
        );
      }

      if (dto.options.filter((option) => option.isCorrect).length !== 1) {
        throw new BadRequestException(
          'Multiple-choice exercises must have exactly one correct option',
        );
      }

      if (dto.acceptedAnswers?.length) {
        throw new BadRequestException(
          'Multiple-choice exercises cannot have accepted text answers',
        );
      }
    }

    if (dto.type === ExerciseType.TEXT_INPUT) {
      if (!dto.acceptedAnswers?.some((answer) => answer.trim().length > 0)) {
        throw new BadRequestException(
          'Text-input exercises require at least one accepted answer',
        );
      }

      if (dto.options?.length) {
        throw new BadRequestException(
          'Text-input exercises cannot have multiple-choice options',
        );
      }
    }
  }

  async create(
    lessonId: string,
    dto: CreateExerciseDto,
    user: AuthenticatedUser,
  ) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    this.validateExerciseContent(dto);

    const scope = await this.getLessonScope(lessonId);

    await this.authorizationService.requireCourseAccess(
      user.id,
      scope.languageId,
      scope.variantId,
    );
    const count = await this.prisma.exercise.count({
      where: { lessonId },
    });

    return this.prisma.exercise.create({
      data: {
        lessonId,
        createdById: user.id,
        type: dto.type,
        prompt: dto.prompt,
        explanation: dto.explanation,
        order: dto.order ?? count,
        options: {
          create: dto.options?.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order,
          })),
        },
        acceptedAnswers: {
          create: dto.acceptedAnswers?.map((value) => ({
            value: value.trim(),
            normalizedValue: this.normalizeAnswer(value),
          })),
        },
      },
      include: {
        options: { orderBy: { order: 'asc' } },
        acceptedAnswers: true,
      },
    });
  }

  async update(
    exerciseId: string,
    dto: UpdateExerciseDto,
    user: AuthenticatedUser,
  ) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        options: true,
        acceptedAnswers: true,
        lesson: {
          select: {
            unit: {
              select: {
                level: {
                  select: {
                    course: { select: { languageId: true, variantId: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise was not found');
    }

    if (exercise.createdById !== user.id) {
      throw new ForbiddenException('You can only edit your own exercises');
    }

    if (
      exercise.status !== ContentStatus.DRAFT &&
      exercise.status !== ContentStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException(
        'Only draft exercises or exercises requiring changes can be edited',
      );
    }

    await this.authorizationService.requireCourseAccess(
      user.id,
      exercise.lesson.unit.level.course.languageId,
      exercise.lesson.unit.level.course.variantId,
    );

    const type = dto.type ?? exercise.type;
    const options =
      dto.options ??
      exercise.options.map((option) => ({
        text: option.text,
        isCorrect: option.isCorrect,
        order: option.order,
      }));
    const acceptedAnswers =
      dto.acceptedAnswers ??
      exercise.acceptedAnswers.map((answer) => answer.value);

    this.validateExerciseContent({
      type,
      options,
      acceptedAnswers,
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.exerciseOption.deleteMany({ where: { exerciseId } });
      await tx.exerciseAnswer.deleteMany({ where: { exerciseId } });

      return tx.exercise.update({
        where: { id: exerciseId },
        data: {
          type,
          prompt: dto.prompt ?? exercise.prompt,
          explanation: dto.explanation ?? exercise.explanation,
          order: dto.order ?? exercise.order,
          status: ContentStatus.DRAFT,
          options: {
            create: options.map((option) => ({
              text: option.text,
              isCorrect: option.isCorrect,
              order: option.order,
            })),
          },
          acceptedAnswers: {
            create: acceptedAnswers.map((value) => ({
              value: value.trim(),
              normalizedValue: this.normalizeAnswer(value),
            })),
          },
        },
        include: {
          options: { orderBy: { order: 'asc' } },
          acceptedAnswers: true,
        },
      });
    });
  }

  async submit(exerciseId: string, user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise was not found');
    }

    if (exercise.createdById !== user.id) {
      throw new ForbiddenException('You can only submit your own exercises');
    }

    if (
      exercise.status !== ContentStatus.DRAFT &&
      exercise.status !== ContentStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException('This exercise cannot be submitted');
    }

    const scope = await this.getLessonScope(exercise.lessonId);

    await this.authorizationService.requireCourseAccess(
      user.id,
      scope.languageId,
      scope.variantId,
    );

    return this.prisma.exercise.update({
      where: { id: exerciseId },
      data: { status: ContentStatus.SUBMITTED },
    });
  }

  async createVersion(exerciseId: string, user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        options: true,
        acceptedAnswers: true,
        lesson: {
          select: {
            unit: {
              select: {
                level: {
                  select: {
                    course: {
                      select: { languageId: true, variantId: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise was not found');
    }

    if (exercise.createdById !== user.id) {
      throw new ForbiddenException('You can only version your own exercises');
    }

    await this.authorizationService.requireCourseAccess(
      user.id,
      exercise.lesson.unit.level.course.languageId,
      exercise.lesson.unit.level.course.variantId,
    );

    if (exercise.status !== ContentStatus.PUBLISHED) {
      throw new BadRequestException(
        'Only published exercises can be versioned',
      );
    }

    const latest = await this.prisma.exercise.findFirst({
      where: {
        versionGroupId: exercise.versionGroupId,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { version: 'desc' },
    });

    if (latest?.id !== exercise.id) {
      throw new BadRequestException(
        'Only the latest published version can be versioned',
      );
    }

    return this.prisma.exercise.create({
      data: {
        lessonId: exercise.lessonId,
        createdById: user.id,
        type: exercise.type,
        prompt: exercise.prompt,
        explanation: exercise.explanation,
        order: exercise.order,
        versionGroupId: exercise.versionGroupId,
        version: exercise.version + 1,
        options: {
          create: exercise.options.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order,
          })),
        },
        acceptedAnswers: {
          create: exercise.acceptedAnswers.map((answer) => ({
            value: answer.value,
            normalizedValue: answer.normalizedValue,
          })),
        },
      },
      include: {
        options: { orderBy: { order: 'asc' } },
        acceptedAnswers: true,
      },
    });
  }

  async findPublishedByLesson(lessonId: string) {
    const lessonExists = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lessonExists) {
      throw new NotFoundException('Lesson was not found');
    }

    const exercises = await this.prisma.exercise.findMany({
      where: {
        lessonId,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: [{ order: 'asc' }, { version: 'desc' }],
      include: {
        options: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            text: true,
            order: true,
          },
        },
      },
    });

    const latestByGroup = new Map<string, (typeof exercises)[number]>();

    for (const exercise of exercises) {
      if (!latestByGroup.has(exercise.versionGroupId)) {
        latestByGroup.set(exercise.versionGroupId, exercise);
      }
    }

    return [...latestByGroup.values()].map((exercise) => ({
      id: exercise.id,
      lessonId: exercise.lessonId,
      type: exercise.type,
      prompt: exercise.prompt,
      explanation: exercise.explanation,
      order: exercise.order,
      version: exercise.version,
      options: exercise.options,
    }));
  }

  async submitAttempt(
    exerciseId: string,
    dto: SubmitAnswerDto,
    user: AuthenticatedUser,
  ) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        options: true,
        acceptedAnswers: true,
      },
    });

    if (!exercise || exercise.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Published exercise was not found');
    }

    const latest = await this.prisma.exercise.findFirst({
      where: {
        versionGroupId: exercise.versionGroupId,
        status: ContentStatus.PUBLISHED,
      },
      orderBy: { version: 'desc' },
      select: { id: true },
    });

    if (latest?.id !== exercise.id) {
      throw new NotFoundException('This exercise version is no longer active');
    }

    let isCorrect = false;
    let selectedOptionId: string | undefined;
    let submittedText: string | undefined;

    if (exercise.type === ExerciseType.MULTIPLE_CHOICE) {
      if (!dto.selectedOptionId || dto.submittedText !== undefined) {
        throw new BadRequestException(
          'Select one option to answer this exercise',
        );
      }

      const option = exercise.options.find(
        (item) => item.id === dto.selectedOptionId,
      );

      if (!option) {
        throw new BadRequestException(
          'The selected option does not belong to this exercise',
        );
      }

      selectedOptionId = option.id;
      isCorrect = option.isCorrect;
    } else {
      if (!dto.submittedText?.trim() || dto.selectedOptionId) {
        throw new BadRequestException(
          'Provide a text answer for this exercise',
        );
      }

      submittedText = dto.submittedText.trim();
      const normalized = this.normalizeAnswer(submittedText);

      isCorrect = exercise.acceptedAnswers.some(
        (answer) => answer.normalizedValue === normalized,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.exerciseAttempt.create({
        data: {
          userId: user.id,
          exerciseId,
          selectedOptionId,
          submittedText,
          isCorrect,
        },
      });

      // A lesson is completed only after at least one correct attempt
      // for every currently published exercise in that lesson.
      const publishedExercises = await tx.exercise.findMany({
        where: {
          lessonId: exercise.lessonId,
          status: ContentStatus.PUBLISHED,
        },
        select: {
          id: true,
          versionGroupId: true,
          version: true,
        },
        orderBy: { version: 'desc' },
      });

      const latestExercises = new Map<
        string,
        (typeof publishedExercises)[number]
      >();

      for (const item of publishedExercises) {
        if (!latestExercises.has(item.versionGroupId)) {
          latestExercises.set(item.versionGroupId, item);
        }
      }

      const exerciseIds = [...latestExercises.values()].map((item) => item.id);

      if (exerciseIds.length > 0) {
        const correctAttempts = await tx.exerciseAttempt.findMany({
          where: {
            userId: user.id,
            exerciseId: { in: exerciseIds },
            isCorrect: true,
          },
          select: { exerciseId: true },
          distinct: ['exerciseId'],
        });

        const completed = correctAttempts.length === exerciseIds.length;

        await tx.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId: user.id,
              lessonId: exercise.lessonId,
            },
          },
          create: {
            userId: user.id,
            lessonId: exercise.lessonId,
            status: completed ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: completed ? new Date() : null,
          },
          update: completed
            ? {
                status: 'COMPLETED',
                completedAt: new Date(),
              }
            : {},
        });
      }

      return {
        attemptId: attempt.id,
        isCorrect,
        explanation: exercise.explanation,
        submittedAt: attempt.createdAt,
      };
    });
  }

  async getReviewQueue(user: AuthenticatedUser) {
    this.requireReviewer(user);

    return this.prisma.exercise.findMany({
      where: {
        status: {
          in: [ContentStatus.SUBMITTED, ContentStatus.UNDER_REVIEW],
        },
        createdById: { not: user.id },
      },
      include: {
        options: { orderBy: { order: 'asc' } },
        acceptedAnswers: true,
        lesson: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        reviews: {
          where: { status: ContentStatus.UNDER_REVIEW },
        },
      },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async startReview(exerciseId: string, user: AuthenticatedUser) {
    this.requireReviewer(user);

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise was not found');
    }

    if (exercise.createdById === user.id) {
      throw new ForbiddenException('You cannot review your own exercise');
    }

    if (exercise.status !== ContentStatus.SUBMITTED) {
      throw new BadRequestException('This exercise is not awaiting review');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.exercise.update({
        where: { id: exerciseId },
        data: { status: ContentStatus.UNDER_REVIEW },
      });

      await tx.exerciseReview.create({
        data: {
          exerciseId,
          reviewerId: user.id,
          status: ContentStatus.UNDER_REVIEW,
        },
      });

      return updated;
    });
  }

  async review(
    exerciseId: string,
    decision: 'approve' | 'changes' | 'reject',
    comment: string | undefined,
    user: AuthenticatedUser,
  ) {
    this.requireReviewer(user);

    if (decision !== 'approve' && !comment?.trim()) {
      throw new BadRequestException(
        'A comment is required for this review decision',
      );
    }

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise was not found');
    }

    if (exercise.createdById === user.id) {
      throw new ForbiddenException('You cannot review your own exercise');
    }

    const activeReview = await this.prisma.exerciseReview.findFirst({
      where: {
        exerciseId,
        reviewerId: user.id,
        status: ContentStatus.UNDER_REVIEW,
      },
    });

    if (exercise.status !== ContentStatus.UNDER_REVIEW || !activeReview) {
      throw new ForbiddenException(
        'You do not own the active review for this exercise',
      );
    }

    const status =
      decision === 'approve'
        ? ContentStatus.PUBLISHED
        : decision === 'changes'
          ? ContentStatus.CHANGES_REQUESTED
          : ContentStatus.REJECTED;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.exercise.update({
        where: { id: exerciseId },
        data: {
          status,
          publishedAt: decision === 'approve' ? new Date() : null,
        },
      });

      await tx.exerciseReview.update({
        where: { id: activeReview.id },
        data: {
          status,
          comment: comment?.trim(),
        },
      });

      return updated;
    });
  }

  async getMyExercises(user: AuthenticatedUser) {
    this.authorizationService.requireRole(user, 'CONTRIBUTOR');

    return this.prisma.exercise.findMany({
      where: { createdById: user.id },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
        acceptedAnswers: true,
        lesson: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            status: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
