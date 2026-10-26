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

  const existingUnit = await prisma.unit.findFirst({
    where: {
      levelId: level.id,
      name: 'Greetings',
    },
  });

  if (!existingUnit) {
    await prisma.unit.create({
      data: {
        levelId: level.id,
        name: 'Greetings',
        description: 'Basic greetings and introductory expressions in Ewondo.',
        order: 1,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
