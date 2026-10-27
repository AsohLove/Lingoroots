import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const ewondo = await prisma.language.findFirst({
    where: {
      name: 'Ewondo',
    },
  });

  if (!ewondo) {
    throw new Error('Ewondo language was not found');
  }

  const course = await prisma.course.findFirst({
    where: {
      languageId: ewondo.id,
    },
  });

  if (!course) {
    throw new Error('Ewondo course was not found');
  }

  await prisma.course.update({
    where: {
      id: course.id,
    },
    data: {
      name: 'General Ewondo',
      description: 'A structured course for learning Ewondo.',
    },
  });

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
        description:
          'Basic greetings and introductory expressions in Ewondo.',
        order: 1,
      },
    });
  }

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
        description:
          'Learn common greetings and introductory expressions.',
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