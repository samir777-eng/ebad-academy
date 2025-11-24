import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany({
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        where: { levelId: 1 },
        orderBy: { order: 'asc' },
        include: {
          questions: true,
        }
      }
    }
  });

  console.log('\n📊 LEVEL 1 CONTENT SUMMARY\n');
  console.log('='.repeat(60));

  let totalLessons = 0;
  let totalQuestions = 0;

  branches.forEach((branch) => {
    console.log(`\n📚 ${branch.nameEn} (${branch.nameAr})`);
    console.log('-'.repeat(60));
    
    if (branch.lessons.length === 0) {
      console.log('  ⚠️  No lessons yet');
    } else {
      branch.lessons.forEach((lesson, index) => {
        console.log(`  ${index + 1}. ${lesson.titleEn}`);
        console.log(`     ${lesson.titleAr}`);
        console.log(`     Questions: ${lesson.questions.length} | Duration: ${lesson.duration} min`);
        totalQuestions += lesson.questions.length;
      });
      totalLessons += branch.lessons.length;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\n✨ TOTAL: ${totalLessons} lessons | ${totalQuestions} questions\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

