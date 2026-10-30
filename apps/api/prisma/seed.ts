import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // ------------------------------------------------------------
  // Development contributor
  // ------------------------------------------------------------

  const contributorPasswordHash = await argon2.hash('password123');

  let contributor = await prisma.user.findUnique({
    where: {
      email: 'contributor@lingoroots.local',
    },
  });

  if (!contributor) {
    contributor = await prisma.user.create({
      data: {
        name: 'LingoRoots Contributor',
        email: 'contributor@lingoroots.local',
        passwordHash: contributorPasswordHash,
      },
    });
  } else {
    contributor = await prisma.user.update({
      where: {
        id: contributor.id,
      },
      data: {
        passwordHash: contributorPasswordHash,
      },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: contributor.id,
        role: 'CONTRIBUTOR',
      },
    },
    update: {},
    create: {
      userId: contributor.id,
      role: 'CONTRIBUTOR',
    },
  });

  // ------------------------------------------------------------
  // Language
  // ------------------------------------------------------------

  let language = await prisma.language.findFirst({
    where: {
      name: 'Ewondo',
    },
  });

  if (!language) {
    language = await prisma.language.create({
      data: {
        name: 'Ewondo',
        description: 'A language spoken primarily in Cameroon.',
      },
    });
  } else {
    language = await prisma.language.update({
      where: {
        id: language.id,
      },
      data: {
        description: 'A language spoken primarily in Cameroon.',
      },
    });
  }

  // ------------------------------------------------------------
  // Contributor language authorization
  // ------------------------------------------------------------

  const existingAuthorization = await prisma.languageAuthorization.findFirst({
    where: {
      userId: contributor.id,
      languageId: language.id,
      variantId: null,
    },
  });

  if (!existingAuthorization) {
    await prisma.languageAuthorization.create({
      data: {
        userId: contributor.id,
        languageId: language.id,
      },
    });
  }

  // ------------------------------------------------------------
  // Course
  // ------------------------------------------------------------

  let course = await prisma.course.findFirst({
    where: {
      languageId: language.id,
      name: 'General Ewondo',
    },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        languageId: language.id,
        name: 'General Ewondo',
        description: 'A structured course for learning Ewondo.',
      },
    });
  } else {
    course = await prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        description: 'A structured course for learning Ewondo.',
      },
    });
  }

  // ------------------------------------------------------------
  // Level
  // ------------------------------------------------------------

  let level = await prisma.level.findFirst({
    where: {
      courseId: course.id,
      code: 'A1',
    },
  });

  if (!level) {
    level = await prisma.level.create({
      data: {
        courseId: course.id,
        code: 'A1',
        name: 'Beginner',
        description: 'Basic introductory Ewondo.',
        order: 1,
      },
    });
  }

  // ------------------------------------------------------------
  // Unit
  // ------------------------------------------------------------

  let unit = await prisma.unit.findFirst({
    where: {
      levelId: level.id,
      name: 'Greetings',
    },
  });

  if (!unit) {
    unit = await prisma.unit.create({
      data: {
        levelId: level.id,
        name: 'Greetings',
        description: 'Basic greetings and introductory expressions in Ewondo.',
        order: 1,
      },
    });
  }

  // ------------------------------------------------------------
  // Lesson
  // ------------------------------------------------------------

  let lesson = await prisma.lesson.findFirst({
    where: {
      unitId: unit.id,
      name: 'Basic Greetings',
    },
  });

  if (!lesson) {
    lesson = await prisma.lesson.create({
      data: {
        unitId: unit.id,
        name: 'Basic Greetings',
        description: 'Learn common greetings and introductory expressions.',
        order: 1,
      },
    });
  }

  // ------------------------------------------------------------
  // Development/demo lesson content
  // ------------------------------------------------------------

  const vocabularyItems = [
    {
      term: 'Mbolo',
      meaning: 'Hello',
      explanation: 'A development/demo greeting.',
      order: 1,
    },
    {
      term: 'A ndzi',
      meaning: 'Thank you',
      explanation: 'A development/demo expression of gratitude.',
      order: 2,
    },
  ];

  for (const item of vocabularyItems) {
    const existingItem = await prisma.vocabularyItem.findFirst({
      where: {
        lessonId: lesson.id,
        term: item.term,
      },
    });

    if (!existingItem) {
      await prisma.vocabularyItem.create({
        data: {
          lessonId: lesson.id,
          createdById: contributor.id,
          term: item.term,
          meaning: item.meaning,
          explanation: item.explanation,
          order: item.order,
        },
      });
    }
  }

  const expressions = [
    {
      text: 'Mbolo wa?',
      translation: 'How are you?',
      explanation:
        'A development/demo expression used when asking about someone’s wellbeing.',
      order: 1,
    },
  ];

  for (const expression of expressions) {
    const existingExpression = await prisma.expression.findFirst({
      where: {
        lessonId: lesson.id,
        text: expression.text,
      },
    });

    if (!existingExpression) {
      await prisma.expression.create({
        data: {
          lessonId: lesson.id,
          text: expression.text,
          translation: expression.translation,
          explanation: expression.explanation,
          order: expression.order,
        },
      });
    }
  }

  const exampleSentences = [
    {
      text: 'Mbolo, wa ke?',
      translation: 'Hello, how are you?',
      explanation:
        'A development/demo sentence combining a greeting with a wellbeing question.',
      order: 1,
    },
  ];

  for (const sentence of exampleSentences) {
    const existingSentence = await prisma.exampleSentence.findFirst({
      where: {
        lessonId: lesson.id,
        text: sentence.text,
      },
    });

    if (!existingSentence) {
      await prisma.exampleSentence.create({
        data: {
          lessonId: lesson.id,
          text: sentence.text,
          translation: sentence.translation,
          explanation: sentence.explanation,
          order: sentence.order,
        },
      });
    }
  }

  console.log('LingoRoots development seed completed.');
  console.log(`Contributor: ${contributor.email}`);
  console.log(`Language: ${language.name}`);
  console.log(`Course: ${course.name}`);
  console.log(`Level: ${level.code} ${level.name}`);
  console.log(`Unit: ${unit.name}`);
  console.log(`Lesson: ${lesson.name}`);
  console.log(`Vocabulary items: ${vocabularyItems.length}`);
  console.log(`Expressions: ${expressions.length}`);
  console.log(`Example sentences: ${exampleSentences.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
