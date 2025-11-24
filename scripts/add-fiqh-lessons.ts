import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Adding Fiqh lessons to Level 1...\n");

  const fiqhBranch = await prisma.branch.findFirst({
    where: { nameEn: "Fiqh" },
  });

  const level1 = await prisma.level.findFirst({
    where: { levelNumber: 1 },
  });

  if (!fiqhBranch || !level1) {
    console.error("❌ Could not find Fiqh branch or Level 1");
    return;
  }

  console.log(
    `✅ Found Fiqh (ID: ${fiqhBranch.id}) and Level 1 (ID: ${level1.id})\n`
  );

  // Check existing lessons
  const existingLessons = await prisma.lesson.findMany({
    where: {
      branchId: fiqhBranch.id,
      levelId: level1.id,
    },
    orderBy: { order: "asc" },
  });

  console.log(`📚 Found ${existingLessons.length} existing Fiqh lessons`);

  if (existingLessons.length >= 3) {
    console.log("⚠️  Already have 3 or more Fiqh lessons. Skipping...");
    return;
  }

  // Lesson 2: Purification (Taharah)
  const lesson2 = await prisma.lesson.create({
    data: {
      branchId: fiqhBranch.id,
      levelId: level1.id,
      titleEn: "Purification (Taharah) - Basics",
      titleAr: "الطهارة - الأساسيات",
      descriptionEn:
        "Understanding the importance of purification in Islam, types of water, and the concept of najasah (impurity).",
      descriptionAr:
        "فهم أهمية الطهارة في الإسلام، أنواع المياه، ومفهوم النجاسة.",
      videoUrlsEn: JSON.stringify([]),
      videoUrlsAr: JSON.stringify([]),
      duration: 30,
      order: 2,
    },
  });

  console.log(`✅ Created Lesson 2: ${lesson2.titleEn}`);

  const lesson2Questions = [
    {
      questionTextEn: "What is the Arabic term for purification?",
      questionTextAr: "ما هو المصطلح العربي للطهارة؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["Taharah", "Salah", "Zakah", "Sawm"]),
      optionsAr: JSON.stringify(["الطهارة", "الصلاة", "الزكاة", "الصوم"]),
      correctAnswer: "0",
      explanationEn:
        "Taharah is the Arabic term for purification, which is essential for prayer.",
      explanationAr: "الطهارة هو المصطلح العربي للتطهير، وهو ضروري للصلاة.",
      order: 1,
    },
    {
      questionTextEn: "Purification is a condition for the validity of prayer.",
      questionTextAr: "الطهارة شرط لصحة الصلاة.",
      type: "true_false",
      optionsEn: JSON.stringify(["True", "False"]),
      optionsAr: JSON.stringify(["صحيح", "خطأ"]),
      correctAnswer: "true",
      explanationEn:
        "Correct! Purification is one of the essential conditions for prayer to be valid.",
      explanationAr: "صحيح! الطهارة من الشروط الأساسية لصحة الصلاة.",
      order: 2,
    },
    {
      questionTextEn:
        "How many types of water are there in Islamic jurisprudence?",
      questionTextAr: "كم عدد أنواع المياه في الفقه الإسلامي؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["One", "Two", "Three", "Four"]),
      optionsAr: JSON.stringify(["واحد", "اثنان", "ثلاثة", "أربعة"]),
      correctAnswer: "1",
      explanationEn:
        "There are two main types: pure water (tahur) and used water (musta'mal).",
      explanationAr: "هناك نوعان رئيسيان: الماء الطاهر والماء المستعمل.",
      order: 3,
    },
    {
      questionTextEn: "What is najasah?",
      questionTextAr: "ما هي النجاسة؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["Impurity", "Cleanliness", "Water", "Prayer"]),
      optionsAr: JSON.stringify(["النجاسة", "النظافة", "الماء", "الصلاة"]),
      correctAnswer: "0",
      explanationEn:
        "Najasah means impurity that must be removed for purification.",
      explanationAr: "النجاسة تعني القذارة التي يجب إزالتها للطهارة.",
      order: 4,
    },
    {
      questionTextEn: "Running water can purify impurities.",
      questionTextAr: "الماء الجاري يمكن أن يطهر النجاسات.",
      type: "true_false",
      optionsEn: JSON.stringify(["True", "False"]),
      optionsAr: JSON.stringify(["صحيح", "خطأ"]),
      correctAnswer: "true",
      explanationEn: "Correct! Running water is considered pure and purifying.",
      explanationAr: "صحيح! الماء الجاري يعتبر طاهراً ومطهراً.",
      order: 5,
    },
  ];

  for (const q of lesson2Questions) {
    await prisma.question.create({
      data: {
        lessonId: lesson2.id,
        ...q,
      },
    });
  }

  console.log(`✅ Added ${lesson2Questions.length} questions for Lesson 2\n`);

  // Lesson 3: Wudu (Ablution)
  const lesson3 = await prisma.lesson.create({
    data: {
      branchId: fiqhBranch.id,
      levelId: level1.id,
      titleEn: "Wudu (Ablution)",
      titleAr: "الوضوء",
      descriptionEn:
        "Learning the steps, conditions, and nullifiers of wudu (ablution) - the ritual purification before prayer.",
      descriptionAr:
        "تعلم خطوات وشروط ونواقض الوضوء - الطهارة الطقسية قبل الصلاة.",
      videoUrlsEn: JSON.stringify([]),
      videoUrlsAr: JSON.stringify([]),
      duration: 35,
      order: 3,
    },
  });

  console.log(`✅ Created Lesson 3: ${lesson3.titleEn}`);

  const lesson3Questions = [
    {
      questionTextEn: "How many obligatory acts (fard) are there in wudu?",
      questionTextAr: "كم عدد الفرائض في الوضوء؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["Four", "Five", "Six", "Seven"]),
      optionsAr: JSON.stringify(["أربعة", "خمسة", "ستة", "سبعة"]),
      correctAnswer: "2",
      explanationEn:
        "There are six obligatory acts in wudu according to most scholars.",
      explanationAr: "هناك ستة فرائض في الوضوء عند أكثر العلماء.",
      order: 1,
    },
    {
      questionTextEn: "What is the first step in performing wudu?",
      questionTextAr: "ما هي الخطوة الأولى في أداء الوضوء؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify([
        "Washing the face",
        "Making intention",
        "Washing hands",
        "Rinsing mouth",
      ]),
      optionsAr: JSON.stringify([
        "غسل الوجه",
        "النية",
        "غسل اليدين",
        "المضمضة",
      ]),
      correctAnswer: "1",
      explanationEn:
        "The intention (niyyah) is the first step, though it is in the heart.",
      explanationAr: "النية هي الخطوة الأولى، وإن كانت في القلب.",
      order: 2,
    },
    {
      questionTextEn: "Sleeping breaks wudu.",
      questionTextAr: "النوم ينقض الوضوء.",
      type: "true_false",
      optionsEn: JSON.stringify(["True", "False"]),
      optionsAr: JSON.stringify(["صحيح", "خطأ"]),
      correctAnswer: "true",
      explanationEn: "Correct! Deep sleep is one of the nullifiers of wudu.",
      explanationAr: "صحيح! النوم العميق من نواقض الوضوء.",
      order: 3,
    },
    {
      questionTextEn: "Which part of the body is wiped (not washed) in wudu?",
      questionTextAr: "أي جزء من الجسم يُمسح (لا يُغسل) في الوضوء؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["Face", "Arms", "Head", "Feet"]),
      optionsAr: JSON.stringify(["الوجه", "الذراعين", "الرأس", "القدمين"]),
      correctAnswer: "2",
      explanationEn: "The head is wiped, not washed, during wudu.",
      explanationAr: "الرأس يُمسح ولا يُغسل في الوضوء.",
      order: 4,
    },
    {
      questionTextEn: "Wudu must be performed in the correct order.",
      questionTextAr: "يجب أداء الوضوء بالترتيب الصحيح.",
      type: "true_false",
      optionsEn: JSON.stringify(["True", "False"]),
      optionsAr: JSON.stringify(["صحيح", "خطأ"]),
      correctAnswer: "true",
      explanationEn:
        "Correct! The order (tartib) is one of the conditions of valid wudu.",
      explanationAr: "صحيح! الترتيب من شروط صحة الوضوء.",
      order: 5,
    },
  ];

  for (const q of lesson3Questions) {
    await prisma.question.create({
      data: {
        lessonId: lesson3.id,
        ...q,
      },
    });
  }

  console.log(`✅ Added ${lesson3Questions.length} questions for Lesson 3\n`);

  console.log("✅ Script completed successfully!\n");
  console.log("📊 Summary:");
  console.log("- Added 2 new Fiqh lessons");
  console.log("\n✨ You can now test these lessons in the app!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
