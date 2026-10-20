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

  await prisma.course.create({
    data: {
      languageId: ewondo.id,
      name: 'Ewondo Beginner',
      description: 'An introductory course for learning Ewondo.',
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });