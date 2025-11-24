import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: {
      branchId: 1,
      levelId: 1,
    },
    orderBy: { order: 'asc' },
    include: {
      questions: true,
    }
  });

  console.log(`\n📚 Aqeedah Level 1 Lessons: ${lessons.length}\n`);
  
  lessons.forEach((lesson, index) => {
    console.log(`${index + 1}. ${lesson.titleEn} (Order: ${lesson.order})`);
    console.log(`   Arabic: ${lesson.titleAr}`);
    console.log(`   Questions: ${lesson.questions.length}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

