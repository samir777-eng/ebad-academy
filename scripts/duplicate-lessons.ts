import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function duplicateLessonsForAllLevels() {
  console.log("🚀 Starting lesson duplication process...\n");

  try {
    // Get all Level 1 lessons with their questions
    const level1Lessons = await prisma.lesson.findMany({
      where: { levelId: 1 },
      include: {
        questions: true,
        branch: true,
      },
      orderBy: { order: "asc" },
    });

    console.log(`📚 Found ${level1Lessons.length} lessons in Level 1\n`);

    // Get all levels
    const levels = await prisma.level.findMany({
      orderBy: { levelNumber: "asc" },
    });

    // Duplicate for levels 2, 3, and 4
    for (const level of levels) {
      if (level.levelNumber === 1) continue; // Skip Level 1

      console.log(`\n📖 Creating lessons for Level ${level.levelNumber}...`);

      for (const lesson of level1Lessons) {
        // Check if lesson already exists for this level and branch
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            levelId: level.id,
            branchId: lesson.branchId,
            order: lesson.order,
          },
        });

        if (existingLesson) {
          console.log(
            `   ⏭️  Skipping "${lesson.titleEn}" (already exists)`
          );
          continue;
        }

        // Create the lesson
        const newLesson = await prisma.lesson.create({
          data: {
            branchId: lesson.branchId,
            levelId: level.id,
            titleAr: lesson.titleAr,
            titleEn: lesson.titleEn,
            descriptionAr: lesson.descriptionAr,
            descriptionEn: lesson.descriptionEn,
            videoUrlsAr: lesson.videoUrlsAr,
            videoUrlsEn: lesson.videoUrlsEn,
            duration: lesson.duration,
            order: lesson.order,
          },
        });

        // Create questions for the new lesson
        for (const question of lesson.questions) {
          await prisma.question.create({
            data: {
              lessonId: newLesson.id,
              questionTextAr: question.questionTextAr,
              questionTextEn: question.questionTextEn,
              type: question.type,
              optionsAr: question.optionsAr,
              optionsEn: question.optionsEn,
              correctAnswer: question.correctAnswer,
              explanationAr: question.explanationAr,
              explanationEn: question.explanationEn,
              order: question.order,
            },
          });
        }

        console.log(
          `   ✅ Created "${lesson.titleEn}" with ${lesson.questions.length} questions`
        );
      }

      console.log(`\n✨ Level ${level.levelNumber} complete!`);
    }

    console.log("\n\n🎉 All lessons duplicated successfully!");
    console.log("\n📊 Summary:");

    // Show summary
    for (const level of levels) {
      const count = await prisma.lesson.count({
        where: { levelId: level.id },
      });
      console.log(
        `   Level ${level.levelNumber}: ${count} lessons`
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
duplicateLessonsForAllLevels()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

