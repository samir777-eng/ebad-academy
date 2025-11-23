import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create test users
  const testUserPassword = await bcrypt.hash("password", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      password: testUserPassword,
      role: "student",
    },
    create: {
      email: "test@example.com",
      name: "Test User",
      idNumber: "EA000001",
      phoneNumber: "+966501234567",
      password: testUserPassword,
      role: "student",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password: adminPassword,
      role: "admin",
    },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      idNumber: "EA000000",
      phoneNumber: "+966509876543",
      password: adminPassword,
      role: "admin",
    },
  });

  console.log(
    "✅ Test users created (test@example.com / password, admin@example.com / admin123)"
  );

  // Create Branches
  const branches = [
    {
      nameAr: "العقيدة",
      nameEn: "Aqeedah",
      icon: "book",
      slug: "aqeedah",
      order: 1,
    },
    { nameAr: "الفقه", nameEn: "Fiqh", icon: "scale", slug: "fiqh", order: 2 },
    {
      nameAr: "السيرة",
      nameEn: "Seerah",
      icon: "user",
      slug: "seerah",
      order: 3,
    },
    {
      nameAr: "التفسير",
      nameEn: "Tafseer",
      icon: "book-open",
      slug: "tafseer",
      order: 4,
    },
    {
      nameAr: "علوم الحديث",
      nameEn: "Hadith Sciences",
      icon: "file-text",
      slug: "hadith",
      order: 5,
    },
    {
      nameAr: "التربية",
      nameEn: "Tarbiyah",
      icon: "heart",
      slug: "tarbiyah",
      order: 6,
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { slug: branch.slug },
      update: {},
      create: branch,
    });
  }

  console.log("✅ Branches created");

  // Create Levels
  const levels = [
    {
      levelNumber: 1,
      nameAr: "المستوى الأول - الأساسيات",
      nameEn: "Level 1 - Fundamentals",
      descriptionAr: "تعلم أساسيات الإسلام من العقيدة والعبادات",
      descriptionEn:
        "Learn the fundamentals of Islam including belief and worship",
      order: 1,
    },
    {
      levelNumber: 2,
      nameAr: "المستوى الثاني - التعمق",
      nameEn: "Level 2 - Deepening",
      descriptionAr: "التعمق في العلوم الإسلامية",
      descriptionEn: "Deepen your understanding of Islamic sciences",
      order: 2,
    },
    {
      levelNumber: 3,
      nameAr: "المستوى الثالث - التخصص",
      nameEn: "Level 3 - Specialization",
      descriptionAr: "التخصص في العلوم الإسلامية المتقدمة",
      descriptionEn: "Specialize in advanced Islamic sciences",
      order: 3,
    },
    {
      levelNumber: 4,
      nameAr: "المستوى الرابع - الإتقان",
      nameEn: "Level 4 - Mastery",
      descriptionAr: "إتقان العلوم الإسلامية والاستعداد للدعوة",
      descriptionEn: "Master Islamic sciences and prepare for dawah",
      order: 4,
    },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { levelNumber: level.levelNumber },
      update: {},
      create: level,
    });
  }

  console.log("✅ Levels created");

  // Create sample lessons for Level 1 - ALL 6 BRANCHES
  const level1 = await prisma.level.findUnique({ where: { levelNumber: 1 } });

  const branchLessons = [
    {
      slug: "aqeedah",
      titleAr: "مقدمة في العقيدة الإسلامية",
      titleEn: "Introduction to Islamic Creed",
      contentAr:
        "العقيدة الإسلامية هي الأساس الذي يبنى عليه الإيمان. تشمل الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره.",
      contentEn:
        "Islamic creed is the foundation upon which faith is built. It includes belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree.",
      questionAr: "ما هي أركان الإيمان؟",
      questionEn: "What are the pillars of faith?",
      optionsAr: ["ستة أركان", "خمسة أركان", "سبعة أركان", "أربعة أركان"],
      optionsEn: [
        "Six pillars",
        "Five pillars",
        "Seven pillars",
        "Four pillars",
      ],
      explanationAr:
        "أركان الإيمان ستة: الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر",
      explanationEn:
        "The pillars of faith are six: Belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree",
    },
    {
      slug: "fiqh",
      titleAr: "مقدمة في الفقه الإسلامي",
      titleEn: "Introduction to Islamic Jurisprudence",
      contentAr:
        "الفقه الإسلامي هو علم الأحكام الشرعية العملية المستمدة من الأدلة التفصيلية. يشمل العبادات والمعاملات والأحوال الشخصية.",
      contentEn:
        "Islamic jurisprudence is the science of practical Islamic rulings derived from detailed evidence. It includes worship, transactions, and personal status.",
      questionAr: "ما هي أركان الإسلام؟",
      questionEn: "What are the pillars of Islam?",
      optionsAr: ["خمسة أركان", "ستة أركان", "أربعة أركان", "سبعة أركان"],
      optionsEn: [
        "Five pillars",
        "Six pillars",
        "Four pillars",
        "Seven pillars",
      ],
      explanationAr:
        "أركان الإسلام خمسة: الشهادتان والصلاة والزكاة والصوم والحج",
      explanationEn:
        "The pillars of Islam are five: Testimony of faith, prayer, charity, fasting, and pilgrimage",
    },
    {
      slug: "seerah",
      titleAr: "مقدمة في السيرة النبوية",
      titleEn: "Introduction to Prophetic Biography",
      contentAr:
        "السيرة النبوية هي دراسة حياة النبي محمد صلى الله عليه وسلم من ولادته حتى وفاته. تشمل أخلاقه وأفعاله وغزواته.",
      contentEn:
        "Prophetic biography is the study of Prophet Muhammad's life from birth to death. It includes his character, actions, and battles.",
      questionAr: "أين ولد النبي محمد صلى الله عليه وسلم؟",
      questionEn: "Where was Prophet Muhammad born?",
      optionsAr: ["مكة المكرمة", "المدينة المنورة", "الطائف", "القدس"],
      optionsEn: ["Makkah", "Madinah", "Taif", "Jerusalem"],
      explanationAr:
        "ولد النبي محمد صلى الله عليه وسلم في مكة المكرمة عام الفيل",
      explanationEn:
        "Prophet Muhammad was born in Makkah in the Year of the Elephant",
    },
    {
      slug: "tafseer",
      titleAr: "مقدمة في التفسير",
      titleEn: "Introduction to Quranic Exegesis",
      contentAr:
        "التفسير هو علم فهم معاني القرآن الكريم وتوضيح مراد الله تعالى من كلامه. يشمل التفسير اللغوي والبياني والموضوعي.",
      contentEn:
        "Tafseer is the science of understanding Quranic meanings and clarifying Allah's intent. It includes linguistic, rhetorical, and thematic interpretation.",
      questionAr: "كم عدد سور القرآن الكريم؟",
      questionEn: "How many chapters are in the Quran?",
      optionsAr: ["114 سورة", "110 سورة", "120 سورة", "100 سورة"],
      optionsEn: [
        "114 chapters",
        "110 chapters",
        "120 chapters",
        "100 chapters",
      ],
      explanationAr: "القرآن الكريم يحتوي على 114 سورة",
      explanationEn: "The Quran contains 114 chapters",
    },
    {
      slug: "hadith",
      titleAr: "مقدمة في علوم الحديث",
      titleEn: "Introduction to Hadith Sciences",
      contentAr:
        "علوم الحديث هي العلوم التي تبحث في أقوال وأفعال وتقريرات النبي صلى الله عليه وسلم. تشمل علم الرواية والدراية.",
      contentEn:
        "Hadith sciences study the sayings, actions, and approvals of Prophet Muhammad. It includes narration and comprehension sciences.",
      questionAr: "ما هي أصح كتب الحديث؟",
      questionEn: "What are the most authentic hadith books?",
      optionsAr: ["صحيح البخاري ومسلم", "سنن أبي داود", "مسند أحمد", "الموطأ"],
      optionsEn: [
        "Sahih Bukhari and Muslim",
        "Sunan Abu Dawud",
        "Musnad Ahmad",
        "Al-Muwatta",
      ],
      explanationAr: "أصح كتب الحديث هما صحيح البخاري وصحيح مسلم",
      explanationEn:
        "The most authentic hadith books are Sahih Bukhari and Sahih Muslim",
    },
    {
      slug: "tarbiyah",
      titleAr: "مقدمة في التربية الإسلامية",
      titleEn: "Introduction to Islamic Education",
      contentAr:
        "التربية الإسلامية هي تنمية الشخصية المسلمة روحياً وأخلاقياً وسلوكياً. تشمل تزكية النفس والأخلاق الحميدة.",
      contentEn:
        "Islamic education is developing Muslim personality spiritually, morally, and behaviorally. It includes self-purification and good character.",
      questionAr: "ما هي أهم صفات المسلم؟",
      questionEn: "What are the most important Muslim characteristics?",
      optionsAr: [
        "الصدق والأمانة",
        "الكذب والخيانة",
        "الكبر والغرور",
        "البخل والطمع",
      ],
      optionsEn: [
        "Honesty and trustworthiness",
        "Lying and betrayal",
        "Arrogance and pride",
        "Stinginess and greed",
      ],
      explanationAr: "من أهم صفات المسلم الصدق والأمانة والإخلاص",
      explanationEn:
        "The most important Muslim characteristics include honesty, trustworthiness, and sincerity",
    },
  ];

  for (const branchData of branchLessons) {
    const branch = await prisma.branch.findUnique({
      where: { slug: branchData.slug },
    });

    if (level1 && branch) {
      const lesson = await prisma.lesson.upsert({
        where: {
          branchId_levelId_order: {
            branchId: branch.id,
            levelId: level1.id,
            order: 1,
          },
        },
        update: {},
        create: {
          branchId: branch.id,
          levelId: level1.id,
          titleAr: branchData.titleAr,
          titleEn: branchData.titleEn,
          descriptionAr: branchData.contentAr,
          descriptionEn: branchData.contentEn,
          videoUrlsAr: JSON.stringify([
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
          ]),
          videoUrlsEn: JSON.stringify([
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
          ]),
          duration: 30,
          order: 1,
        },
      });

      // Create questions for Aqeedah lesson (15 comprehensive questions)
      if (branchData.slug === "aqeedah") {
        const aqeedahQuestions = [
          {
            questionTextAr: "ما هي أركان الإيمان؟",
            questionTextEn: "What are the pillars of faith?",
            type: "multiple_choice",
            optionsAr: ["ستة أركان", "خمسة أركان", "سبعة أركان", "أربعة أركان"],
            optionsEn: [
              "Six pillars",
              "Five pillars",
              "Seven pillars",
              "Four pillars",
            ],
            correctAnswer: "0",
            explanationAr:
              "أركان الإيمان ستة: الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره",
            explanationEn:
              "The pillars of faith are six: belief in Allah, His angels, His books, His messengers, the Last Day, and divine decree (good and bad)",
          },
          {
            questionTextAr: "من هو أول الأنبياء؟",
            questionTextEn: "Who is the first prophet?",
            type: "multiple_choice",
            optionsAr: [
              "آدم عليه السلام",
              "نوح عليه السلام",
              "إبراهيم عليه السلام",
              "موسى عليه السلام",
            ],
            optionsEn: [
              "Adam (peace be upon him)",
              "Noah (peace be upon him)",
              "Abraham (peace be upon him)",
              "Moses (peace be upon him)",
            ],
            correctAnswer: "0",
            explanationAr: "آدم عليه السلام هو أول الأنبياء وأول البشر",
            explanationEn:
              "Adam (peace be upon him) is the first prophet and the first human",
          },
          {
            questionTextAr: "كم عدد الملائكة المذكورين بأسمائهم في القرآن؟",
            questionTextEn:
              "How many angels are mentioned by name in the Quran?",
            type: "multiple_choice",
            optionsAr: ["ثلاثة", "أربعة", "خمسة", "ستة"],
            optionsEn: ["Three", "Four", "Five", "Six"],
            correctAnswer: "0",
            explanationAr:
              "الملائكة المذكورون بأسمائهم في القرآن هم: جبريل وميكائيل ومالك",
            explanationEn:
              "The angels mentioned by name in the Quran are: Gabriel, Michael, and Malik",
          },
          {
            questionTextAr: "هل الإيمان بالقدر يعني الاستسلام وترك العمل؟",
            questionTextEn:
              "Does belief in divine decree mean surrender and abandoning work?",
            type: "true_false",
            optionsAr: null,
            optionsEn: null,
            correctAnswer: "false",
            explanationAr:
              "الإيمان بالقدر لا يعني ترك العمل، بل يجب الأخذ بالأسباب مع التوكل على الله",
            explanationEn:
              "Belief in divine decree does not mean abandoning work; rather, one must take means while relying on Allah",
          },
          {
            questionTextAr: "ما هو أول ركن من أركان الإسلام؟",
            questionTextEn: "What is the first pillar of Islam?",
            type: "multiple_choice",
            optionsAr: ["الشهادتان", "الصلاة", "الزكاة", "الصوم"],
            optionsEn: ["The two testimonies", "Prayer", "Zakat", "Fasting"],
            correctAnswer: "0",
            explanationAr:
              "أول ركن من أركان الإسلام هو الشهادتان: أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله",
            explanationEn:
              "The first pillar of Islam is the two testimonies: I bear witness that there is no god but Allah and Muhammad is the messenger of Allah",
          },
          {
            questionTextAr: "كم عدد الكتب السماوية المذكورة في القرآن؟",
            questionTextEn: "How many divine books are mentioned in the Quran?",
            type: "multiple_choice",
            optionsAr: ["خمسة", "أربعة", "ثلاثة", "ستة"],
            optionsEn: ["Five", "Four", "Three", "Six"],
            correctAnswer: "1",
            explanationAr:
              "الكتب السماوية المذكورة في القرآن هي: التوراة والإنجيل والزبور والقرآن",
            explanationEn:
              "The divine books mentioned in the Quran are: Torah, Gospel, Psalms, and Quran",
          },
          {
            questionTextAr: "هل يجب الإيمان بجميع الأنبياء والرسل؟",
            questionTextEn:
              "Is it obligatory to believe in all prophets and messengers?",
            type: "true_false",
            optionsAr: null,
            optionsEn: null,
            correctAnswer: "true",
            explanationAr:
              "نعم، يجب الإيمان بجميع الأنبياء والرسل دون تفريق بينهم",
            explanationEn:
              "Yes, it is obligatory to believe in all prophets and messengers without distinction",
          },
          {
            questionTextAr: "ما هو اليوم الآخر؟",
            questionTextEn: "What is the Last Day?",
            type: "multiple_choice",
            optionsAr: ["يوم القيامة", "يوم الجمعة", "يوم عرفة", "يوم النحر"],
            optionsEn: [
              "Day of Resurrection",
              "Friday",
              "Day of Arafah",
              "Day of Sacrifice",
            ],
            correctAnswer: "0",
            explanationAr:
              "اليوم الآخر هو يوم القيامة الذي يبعث فيه الناس للحساب والجزاء",
            explanationEn:
              "The Last Day is the Day of Resurrection when people will be resurrected for judgment and recompense",
          },
          {
            questionTextAr: "من هو خاتم الأنبياء والمرسلين؟",
            questionTextEn: "Who is the seal of prophets and messengers?",
            type: "multiple_choice",
            optionsAr: [
              "محمد صلى الله عليه وسلم",
              "عيسى عليه السلام",
              "موسى عليه السلام",
              "إبراهيم عليه السلام",
            ],
            optionsEn: [
              "Muhammad (peace be upon him)",
              "Jesus (peace be upon him)",
              "Moses (peace be upon him)",
              "Abraham (peace be upon him)",
            ],
            correctAnswer: "0",
            explanationAr:
              "محمد صلى الله عليه وسلم هو خاتم الأنبياء والمرسلين، لا نبي بعده",
            explanationEn:
              "Muhammad (peace be upon him) is the seal of prophets and messengers, there is no prophet after him",
          },
          {
            questionTextAr: "هل الملائكة معصومون من الخطأ؟",
            questionTextEn: "Are angels infallible from error?",
            type: "true_false",
            optionsAr: null,
            optionsEn: null,
            correctAnswer: "true",
            explanationAr:
              "نعم، الملائكة معصومون من الخطأ والمعصية، يفعلون ما يؤمرون",
            explanationEn:
              "Yes, angels are infallible from error and sin, they do what they are commanded",
          },
          {
            questionTextAr: "ما هي أعظم سورة في القرآن؟",
            questionTextEn: "What is the greatest surah in the Quran?",
            type: "multiple_choice",
            optionsAr: [
              "سورة الفاتحة",
              "سورة البقرة",
              "سورة الإخلاص",
              "سورة يس",
            ],
            optionsEn: [
              "Surah Al-Fatihah",
              "Surah Al-Baqarah",
              "Surah Al-Ikhlas",
              "Surah Yasin",
            ],
            correctAnswer: "0",
            explanationAr:
              "سورة الفاتحة هي أعظم سورة في القرآن كما ورد في الحديث الصحيح",
            explanationEn:
              "Surah Al-Fatihah is the greatest surah in the Quran as mentioned in authentic hadith",
          },
          {
            questionTextAr: "كم عدد أولي العزم من الرسل؟",
            questionTextEn:
              "How many are the messengers of strong will (Ulul-Azm)?",
            type: "multiple_choice",
            optionsAr: ["خمسة", "ستة", "سبعة", "أربعة"],
            optionsEn: ["Five", "Six", "Seven", "Four"],
            correctAnswer: "0",
            explanationAr:
              "أولو العزم من الرسل خمسة: نوح وإبراهيم وموسى وعيسى ومحمد عليهم الصلاة والسلام",
            explanationEn:
              "The messengers of strong will are five: Noah, Abraham, Moses, Jesus, and Muhammad (peace be upon them)",
          },
          {
            questionTextAr:
              "هل يجوز الاستغاثة بغير الله فيما لا يقدر عليه إلا الله؟",
            questionTextEn:
              "Is it permissible to seek help from other than Allah in what only Allah can do?",
            type: "true_false",
            optionsAr: null,
            optionsEn: null,
            correctAnswer: "false",
            explanationAr:
              "لا يجوز الاستغاثة بغير الله فيما لا يقدر عليه إلا الله، فهذا من الشرك الأكبر",
            explanationEn:
              "It is not permissible to seek help from other than Allah in what only Allah can do, as this is major shirk",
          },
          {
            questionTextAr: "ما هو التوحيد؟",
            questionTextEn: "What is Tawheed (monotheism)?",
            type: "multiple_choice",
            optionsAr: [
              "إفراد الله بالعبادة",
              "عبادة الأصنام",
              "الشرك بالله",
              "الكفر بالله",
            ],
            optionsEn: [
              "Singling out Allah in worship",
              "Idol worship",
              "Associating partners with Allah",
              "Disbelief in Allah",
            ],
            correctAnswer: "0",
            explanationAr:
              "التوحيد هو إفراد الله تعالى بالعبادة والربوبية والأسماء والصفات",
            explanationEn:
              "Tawheed is singling out Allah in worship, lordship, and His names and attributes",
          },
          {
            questionTextAr: "هل الإيمان يزيد وينقص؟",
            questionTextEn: "Does faith increase and decrease?",
            type: "true_false",
            optionsAr: null,
            optionsEn: null,
            correctAnswer: "true",
            explanationAr: "نعم، الإيمان يزيد بالطاعة وينقص بالمعصية",
            explanationEn:
              "Yes, faith increases with obedience and decreases with disobedience",
          },
        ];

        for (let i = 0; i < aqeedahQuestions.length; i++) {
          const existingQuestion = await prisma.question.findFirst({
            where: {
              lessonId: lesson.id,
              order: i + 1,
            },
          });

          if (!existingQuestion) {
            const question = aqeedahQuestions[i];
            await prisma.question.create({
              data: {
                lessonId: lesson.id,
                questionTextAr: question.questionTextAr,
                questionTextEn: question.questionTextEn,
                type: question.type,
                optionsAr: question.optionsAr
                  ? JSON.stringify(question.optionsAr)
                  : null,
                optionsEn: question.optionsEn
                  ? JSON.stringify(question.optionsEn)
                  : null,
                correctAnswer: question.correctAnswer,
                explanationAr: question.explanationAr,
                explanationEn: question.explanationEn,
                order: i + 1,
              },
            });
          }
        }
        console.log(`✅ 15 questions created for Aqeedah lesson`);
      } else {
        // Create single sample question for other lessons
        const existingQuestion = await prisma.question.findFirst({
          where: {
            lessonId: lesson.id,
            order: 1,
          },
        });

        if (!existingQuestion) {
          await prisma.question.create({
            data: {
              lessonId: lesson.id,
              questionTextAr: branchData.questionAr,
              questionTextEn: branchData.questionEn,
              type: "multiple_choice",
              optionsAr: JSON.stringify(branchData.optionsAr),
              optionsEn: JSON.stringify(branchData.optionsEn),
              correctAnswer: "0",
              explanationAr: branchData.explanationAr,
              explanationEn: branchData.explanationEn,
              order: 1,
            },
          });
        }
      }

      console.log(`✅ Sample lesson created for ${branchData.slug}`);
    }
  }

  // Unlock Level 1 for test user
  if (level1 && testUser) {
    await prisma.userLevelStatus.upsert({
      where: {
        userId_levelId: {
          userId: testUser.id,
          levelId: level1.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        levelId: level1.id,
        isUnlocked: true,
        unlockedAt: new Date(),
      },
    });
    console.log("✅ Level 1 unlocked for test user");
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
