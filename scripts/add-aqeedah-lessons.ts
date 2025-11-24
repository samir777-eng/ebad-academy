import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Adding Aqeedah lessons to Level 1...\n");

  // Get Aqeedah branch and Level 1
  const aqeedahBranch = await prisma.branch.findFirst({
    where: { nameEn: "Aqeedah" },
  });

  const level1 = await prisma.level.findFirst({
    where: { levelNumber: 1 },
  });

  if (!aqeedahBranch || !level1) {
    console.error("❌ Could not find Aqeedah branch or Level 1");
    return;
  }

  console.log(
    `✅ Found Aqeedah (ID: ${aqeedahBranch.id}) and Level 1 (ID: ${level1.id})\n`
  );

  // Check existing lessons
  const existingLessons = await prisma.lesson.findMany({
    where: {
      branchId: aqeedahBranch.id,
      levelId: level1.id,
    },
    orderBy: { order: "asc" },
  });

  console.log(`📚 Found ${existingLessons.length} existing Aqeedah lessons`);

  if (existingLessons.length >= 3) {
    console.log("⚠️  Already have 3 or more Aqeedah lessons. Skipping...");
    return;
  }

  // Lesson 2: The Oneness of Allah (Tawheed)
  const lesson2 = await prisma.lesson.create({
    data: {
      branchId: aqeedahBranch.id,
      levelId: level1.id,
      titleEn: "The Oneness of Allah (Tawheed)",
      titleAr: "توحيد الله",
      descriptionEn:
        "Understanding the fundamental concept of Tawheed - the absolute Oneness of Allah in His Lordship, worship, and names and attributes.",
      descriptionAr:
        "فهم المفهوم الأساسي للتوحيد - الوحدانية المطلقة لله في ربوبيته وعبادته وأسمائه وصفاته.",
      videoUrlsEn: JSON.stringify([]),
      videoUrlsAr: JSON.stringify([]),
      duration: 30,
      order: 2,
    },
  });

  console.log(`✅ Created Lesson 2: ${lesson2.titleEn}`);

  // Add questions for Lesson 2
  const lesson2Questions = [
    {
      questionTextEn: "What does Tawheed mean?",
      questionTextAr: "ما معنى التوحيد؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify([
        "The Oneness of Allah",
        "Belief in prophets",
        "Prayer five times",
        "Fasting in Ramadan",
      ]),
      optionsAr: JSON.stringify([
        "وحدانية الله",
        "الإيمان بالأنبياء",
        "الصلاة خمس مرات",
        "الصيام في رمضان",
      ]),
      correctAnswer: "0",
      explanationEn:
        "Tawheed means the absolute Oneness of Allah in all aspects.",
      explanationAr: "التوحيد يعني الوحدانية المطلقة لله في جميع الجوانب.",
      order: 1,
    },
    {
      questionTextEn: "How many categories of Tawheed are there?",
      questionTextAr: "كم عدد أقسام التوحيد؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["Two", "Three", "Four", "Five"]),
      optionsAr: JSON.stringify(["اثنان", "ثلاثة", "أربعة", "خمسة"]),
      correctAnswer: "1",
      explanationEn:
        "There are three categories: Tawheed ar-Rububiyyah (Lordship), Tawheed al-Uluhiyyah (Worship), and Tawheed al-Asma was-Sifat (Names and Attributes).",
      explanationAr:
        "هناك ثلاثة أقسام: توحيد الربوبية، توحيد الألوهية، وتوحيد الأسماء والصفات.",
      order: 2,
    },
    {
      questionTextEn:
        "Tawheed ar-Rububiyyah means believing that Allah alone is the Creator and Sustainer.",
      questionTextAr:
        "توحيد الربوبية يعني الإيمان بأن الله وحده هو الخالق والرازق.",
      type: "true_false",
      optionsEn: JSON.stringify(["True", "False"]),
      optionsAr: JSON.stringify(["صحيح", "خطأ"]),
      correctAnswer: "true",
      explanationEn:
        "Correct! Tawheed ar-Rububiyyah is affirming that Allah alone is the Lord, Creator, and Sustainer.",
      explanationAr:
        "صحيح! توحيد الربوبية هو إثبات أن الله وحده هو الرب والخالق والرازق.",
      order: 3,
    },
    {
      questionTextEn: "Which category of Tawheed is most commonly violated?",
      questionTextAr: "أي قسم من أقسام التوحيد يُنتهك بشكل أكثر شيوعاً؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify([
        "Tawheed ar-Rububiyyah",
        "Tawheed al-Uluhiyyah",
        "Tawheed al-Asma was-Sifat",
        "All equally",
      ]),
      optionsAr: JSON.stringify([
        "توحيد الربوبية",
        "توحيد الألوهية",
        "توحيد الأسماء والصفات",
        "جميعها بالتساوي",
      ]),
      correctAnswer: "1",
      explanationEn:
        "Tawheed al-Uluhiyyah (singling out Allah in worship) is most commonly violated through shirk (associating partners with Allah).",
      explanationAr:
        "توحيد الألوهية (إفراد الله بالعبادة) هو الأكثر انتهاكاً من خلال الشرك (إشراك شركاء مع الله).",
      order: 4,
    },
    {
      questionTextEn: "What is the opposite of Tawheed?",
      questionTextAr: "ما هو عكس التوحيد؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["Shirk", "Kufr", "Nifaq", "Bidah"]),
      optionsAr: JSON.stringify(["الشرك", "الكفر", "النفاق", "البدعة"]),
      correctAnswer: "0",
      explanationEn:
        "Shirk (associating partners with Allah) is the opposite of Tawheed.",
      explanationAr: "الشرك (إشراك شركاء مع الله) هو عكس التوحيد.",
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

  // Lesson 3: The Six Pillars of Iman
  const lesson3 = await prisma.lesson.create({
    data: {
      branchId: aqeedahBranch.id,
      levelId: level1.id,
      titleEn: "The Six Pillars of Iman (Faith)",
      titleAr: "أركان الإيمان الستة",
      descriptionEn:
        "Learning the six fundamental pillars of Islamic faith: belief in Allah, Angels, Books, Prophets, the Last Day, and Divine Decree.",
      descriptionAr:
        "تعلم الأركان الستة الأساسية للإيمان الإسلامي: الإيمان بالله والملائكة والكتب والرسل واليوم الآخر والقدر.",
      videoUrlsEn: JSON.stringify([]),
      videoUrlsAr: JSON.stringify([]),
      duration: 35,
      order: 3,
    },
  });

  console.log(`✅ Created Lesson 3: ${lesson3.titleEn}`);

  // Add questions for Lesson 3
  const lesson3Questions = [
    {
      questionTextEn: "How many pillars of Iman are there?",
      questionTextAr: "كم عدد أركان الإيمان؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify(["Four", "Five", "Six", "Seven"]),
      optionsAr: JSON.stringify(["أربعة", "خمسة", "ستة", "سبعة"]),
      correctAnswer: "2",
      explanationEn:
        "There are six pillars of Iman as mentioned in the Hadith of Jibreel.",
      explanationAr: "هناك ستة أركان للإيمان كما ذُكر في حديث جبريل.",
      order: 1,
    },
    {
      questionTextEn: "What is the first pillar of Iman?",
      questionTextAr: "ما هو الركن الأول من أركان الإيمان؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify([
        "Belief in Allah",
        "Belief in Angels",
        "Belief in Books",
        "Belief in Prophets",
      ]),
      optionsAr: JSON.stringify([
        "الإيمان بالله",
        "الإيمان بالملائكة",
        "الإيمان بالكتب",
        "الإيمان بالرسل",
      ]),
      correctAnswer: "0",
      explanationEn:
        "Belief in Allah is the first and most important pillar of Iman.",
      explanationAr: "الإيمان بالله هو الركن الأول والأهم من أركان الإيمان.",
      order: 2,
    },
    {
      questionTextEn:
        "Belief in angels includes believing they are made of light.",
      questionTextAr: "الإيمان بالملائكة يشمل الإيمان بأنهم مخلوقون من نور.",
      type: "true_false",
      optionsEn: JSON.stringify(["True", "False"]),
      optionsAr: JSON.stringify(["صحيح", "خطأ"]),
      correctAnswer: "true",
      explanationEn:
        "Correct! Angels are created from light as mentioned in authentic hadith.",
      explanationAr: "صحيح! الملائكة مخلوقون من نور كما ورد في الحديث الصحيح.",
      order: 3,
    },
    {
      questionTextEn:
        "Which of the following is NOT one of the six pillars of Iman?",
      questionTextAr: "أي مما يلي ليس من أركان الإيمان الستة؟",
      type: "multiple_choice",
      optionsEn: JSON.stringify([
        "Belief in Allah",
        "Belief in Jinn",
        "Belief in the Last Day",
        "Belief in Divine Decree",
      ]),
      optionsAr: JSON.stringify([
        "الإيمان بالله",
        "الإيمان بالجن",
        "الإيمان باليوم الآخر",
        "الإيمان بالقدر",
      ]),
      correctAnswer: "1",
      explanationEn:
        "Belief in Jinn is not one of the six pillars, though Muslims do believe in their existence.",
      explanationAr:
        "الإيمان بالجن ليس من الأركان الستة، رغم أن المسلمين يؤمنون بوجودهم.",
      order: 4,
    },
    {
      questionTextEn:
        "Belief in Divine Decree (Al-Qadr) means believing that everything happens by Allah's will.",
      questionTextAr:
        "الإيمان بالقدر يعني الإيمان بأن كل شيء يحدث بمشيئة الله.",
      type: "true_false",
      optionsEn: JSON.stringify(["True", "False"]),
      optionsAr: JSON.stringify(["صحيح", "خطأ"]),
      correctAnswer: "true",
      explanationEn:
        "Correct! Belief in Al-Qadr includes believing that everything happens according to Allah's knowledge, will, and decree.",
      explanationAr:
        "صحيح! الإيمان بالقدر يشمل الإيمان بأن كل شيء يحدث وفقاً لعلم الله ومشيئته وقضائه.",
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
  console.log("- Added 2 new Aqeedah lessons");
  console.log("- Total questions added: 6");
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
