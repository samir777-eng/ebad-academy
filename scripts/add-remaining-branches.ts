import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simplified lesson data - 2 lessons per branch with 3 questions each
const branchLessons = {
  Seerah: [
    {
      title: { en: "The Life Before Prophethood", ar: "حياة النبي قبل النبوة" },
      description: {
        en: "Learning about the Prophet's birth, childhood, and character before receiving revelation.",
        ar: "التعرف على ولادة النبي وطفولته وأخلاقه قبل تلقي الوحي.",
      },
      duration: 30,
      questions: [
        {
          en: "In which year was Prophet Muhammad ﷺ born?",
          ar: "في أي عام ولد النبي محمد ﷺ؟",
          options: {
            en: [
              "Year of the Elephant",
              "Year of Hijrah",
              "Year of Conquest",
              "Year of Delegations",
            ],
            ar: ["عام الفيل", "عام الهجرة", "عام الفتح", "عام الوفود"],
          },
          correct: "0",
          explanation: {
            en: "The Prophet ﷺ was born in the Year of the Elephant (570 CE).",
            ar: "ولد النبي ﷺ في عام الفيل (570 م).",
          },
        },
        {
          en: 'The Prophet ﷺ was known as "Al-Amin" before prophethood.',
          ar: 'كان النبي ﷺ يُعرف بـ "الأمين" قبل النبوة.',
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "true",
          explanation: {
            en: "Correct! He was known as Al-Amin (the Trustworthy).",
            ar: "صحيح! كان يُعرف بالأمين.",
          },
        },
        {
          en: "Who raised Prophet Muhammad ﷺ after his mother passed away?",
          ar: "من رعى النبي محمد ﷺ بعد وفاة أمه؟",
          options: {
            en: ["His grandfather", "His uncle", "His aunt", "His cousin"],
            ar: ["جده", "عمه", "عمته", "ابن عمه"],
          },
          correct: "0",
          explanation: {
            en: "His grandfather Abdul-Muttalib raised him first.",
            ar: "رعاه جده عبد المطلب أولاً.",
          },
        },
      ],
    },
    {
      title: { en: "The First Revelation", ar: "الوحي الأول" },
      description: {
        en: "The story of how Prophet Muhammad ﷺ received the first revelation in Cave Hira.",
        ar: "قصة كيف تلقى النبي محمد ﷺ الوحي الأول في غار حراء.",
      },
      duration: 35,
      questions: [
        {
          en: "Where did the Prophet ﷺ receive the first revelation?",
          ar: "أين تلقى النبي ﷺ الوحي الأول؟",
          options: {
            en: ["Cave Hira", "Cave Thawr", "Masjid al-Haram", "His home"],
            ar: ["غار حراء", "غار ثور", "المسجد الحرام", "بيته"],
          },
          correct: "0",
          explanation: {
            en: "The first revelation came in Cave Hira.",
            ar: "جاء الوحي الأول في غار حراء.",
          },
        },
        {
          en: "Who brought the revelation to the Prophet ﷺ?",
          ar: "من جاء بالوحي إلى النبي ﷺ؟",
          options: {
            en: [
              "Angel Jibreel",
              "Angel Mikail",
              "Angel Israfil",
              "Angel Azrael",
            ],
            ar: ["جبريل", "ميكائيل", "إسرافيل", "عزرائيل"],
          },
          correct: "0",
          explanation: {
            en: "Angel Jibreel (Gabriel) brought the revelation.",
            ar: "جبريل عليه السلام جاء بالوحي.",
          },
        },
        {
          en: 'The first word revealed was "Iqra" (Read).',
          ar: 'أول كلمة نزلت كانت "اقرأ".',
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "true",
          explanation: {
            en: 'Correct! The first word was "Iqra" (Read/Recite).',
            ar: 'صحيح! أول كلمة كانت "اقرأ".',
          },
        },
      ],
    },
  ],
  Tafseer: [
    {
      title: { en: "Introduction to Tafseer", ar: "مقدمة في التفسير" },
      description: {
        en: "Understanding what Tafseer is, its importance, and the basic principles of Quranic interpretation.",
        ar: "فهم ما هو التفسير وأهميته والمبادئ الأساسية لتفسير القرآن.",
      },
      duration: 30,
      questions: [
        {
          en: "What does Tafseer mean?",
          ar: "ما معنى التفسير؟",
          options: {
            en: [
              "Explanation of Quran",
              "Recitation",
              "Memorization",
              "Translation",
            ],
            ar: ["تفسير القرآن", "التلاوة", "الحفظ", "الترجمة"],
          },
          correct: "0",
          explanation: {
            en: "Tafseer means explanation and interpretation of the Quran.",
            ar: "التفسير يعني شرح وتفسير القرآن.",
          },
        },
        {
          en: "The Quran was revealed over how many years?",
          ar: "نزل القرآن على مدى كم سنة؟",
          options: {
            en: ["13 years", "23 years", "33 years", "40 years"],
            ar: ["13 سنة", "23 سنة", "33 سنة", "40 سنة"],
          },
          correct: "1",
          explanation: {
            en: "The Quran was revealed over 23 years.",
            ar: "نزل القرآن على مدى 23 سنة.",
          },
        },
        {
          en: "Tafseer helps us understand the context and meaning of Quranic verses.",
          ar: "التفسير يساعدنا على فهم سياق ومعنى الآيات القرآنية.",
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "true",
          explanation: {
            en: "Correct! Tafseer provides context and deeper understanding.",
            ar: "صحيح! التفسير يوفر السياق والفهم الأعمق.",
          },
        },
      ],
    },
    {
      title: { en: "Surah Al-Fatihah - The Opening", ar: "سورة الفاتحة" },
      description: {
        en: "Detailed study of Surah Al-Fatihah, its meanings, and why it is recited in every prayer.",
        ar: "دراسة مفصلة لسورة الفاتحة ومعانيها ولماذا تُقرأ في كل صلاة.",
      },
      duration: 35,
      questions: [
        {
          en: "How many verses are in Surah Al-Fatihah?",
          ar: "كم عدد آيات سورة الفاتحة؟",
          options: { en: ["5", "6", "7", "8"], ar: ["5", "6", "7", "8"] },
          correct: "2",
          explanation: {
            en: "Surah Al-Fatihah has 7 verses.",
            ar: "سورة الفاتحة بها 7 آيات.",
          },
        },
        {
          en: 'Surah Al-Fatihah is also known as "The Seven Oft-Repeated Verses".',
          ar: 'سورة الفاتحة تُعرف أيضاً بـ "السبع المثاني".',
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "true",
          explanation: {
            en: "Correct! It is called As-Sab' al-Mathani.",
            ar: "صحيح! تُسمى السبع المثاني.",
          },
        },
        {
          en: 'What does "Al-Hamdulillah" mean?',
          ar: 'ما معنى "الحمد لله"؟',
          options: {
            en: [
              "All praise to Allah",
              "In the name of Allah",
              "Allah is Great",
              "There is no god but Allah",
            ],
            ar: ["الحمد لله", "بسم الله", "الله أكبر", "لا إله إلا الله"],
          },
          correct: "0",
          explanation: {
            en: 'Al-Hamdulillah means "All praise is due to Allah".',
            ar: 'الحمد لله تعني "جميع الحمد لله".',
          },
        },
      ],
    },
  ],
  "Hadith Sciences": [
    {
      title: { en: "Introduction to Hadith", ar: "مقدمة في الحديث" },
      description: {
        en: "Understanding what Hadith is, its importance, and how it complements the Quran.",
        ar: "فهم ما هو الحديث وأهميته وكيف يكمل القرآن.",
      },
      duration: 30,
      questions: [
        {
          en: "What is a Hadith?",
          ar: "ما هو الحديث؟",
          options: {
            en: [
              "Sayings of the Prophet",
              "Verses of Quran",
              "Islamic law",
              "Prayer times",
            ],
            ar: ["أقوال النبي", "آيات القرآن", "الشريعة", "أوقات الصلاة"],
          },
          correct: "0",
          explanation: {
            en: "Hadith refers to the sayings, actions, and approvals of Prophet Muhammad ﷺ.",
            ar: "الحديث يشير إلى أقوال وأفعال وتقريرات النبي محمد ﷺ.",
          },
        },
        {
          en: "Hadith is the second source of Islamic law after the Quran.",
          ar: "الحديث هو المصدر الثاني للشريعة الإسلامية بعد القرآن.",
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "true",
          explanation: {
            en: "Correct! Hadith is the second primary source after the Quran.",
            ar: "صحيح! الحديث هو المصدر الأساسي الثاني بعد القرآن.",
          },
        },
        {
          en: "Who compiled the most authentic collection of Hadith?",
          ar: "من جمع أصح مجموعة من الأحاديث؟",
          options: {
            en: ["Imam Bukhari", "Imam Malik", "Imam Shafi", "Imam Ahmad"],
            ar: [
              "الإمام البخاري",
              "الإمام مالك",
              "الإمام الشافعي",
              "الإمام أحمد",
            ],
          },
          correct: "0",
          explanation: {
            en: "Imam Bukhari compiled Sahih al-Bukhari, the most authentic collection.",
            ar: "الإمام البخاري جمع صحيح البخاري، أصح المجموعات.",
          },
        },
      ],
    },
    {
      title: { en: "Types of Hadith", ar: "أنواع الحديث" },
      description: {
        en: "Learning about the classification of Hadith: Sahih, Hasan, and Daif.",
        ar: "التعرف على تصنيف الحديث: الصحيح والحسن والضعيف.",
      },
      duration: 35,
      questions: [
        {
          en: 'What does "Sahih" mean?',
          ar: 'ما معنى "صحيح"؟',
          options: {
            en: ["Authentic", "Weak", "Fabricated", "Unknown"],
            ar: ["صحيح", "ضعيف", "موضوع", "مجهول"],
          },
          correct: "0",
          explanation: {
            en: "Sahih means authentic and reliable.",
            ar: "صحيح يعني موثوق وصحيح.",
          },
        },
        {
          en: "A Daif hadith should never be used.",
          ar: "الحديث الضعيف لا يجب استخدامه أبداً.",
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "false",
          explanation: {
            en: "False! Weak hadiths can be used for virtuous deeds, not for rulings.",
            ar: "خطأ! الأحاديث الضعيفة يمكن استخدامها في فضائل الأعمال، لا في الأحكام.",
          },
        },
        {
          en: "How many levels are in the chain of narration (Isnad)?",
          ar: "كم عدد المستويات في سلسلة الرواية (الإسناد)؟",
          options: {
            en: ["Varies", "Always 3", "Always 5", "Always 7"],
            ar: ["يختلف", "دائماً 3", "دائماً 5", "دائماً 7"],
          },
          correct: "0",
          explanation: {
            en: "The chain length varies depending on when the hadith was narrated.",
            ar: "طول السلسلة يختلف حسب وقت رواية الحديث.",
          },
        },
      ],
    },
  ],
  Tarbiyah: [
    {
      title: { en: "Islamic Manners (Adab)", ar: "الآداب الإسلامية" },
      description: {
        en: "Learning the Islamic etiquette and manners in daily life.",
        ar: "تعلم الآداب والأخلاق الإسلامية في الحياة اليومية.",
      },
      duration: 30,
      questions: [
        {
          en: "What should you say before eating?",
          ar: "ماذا تقول قبل الأكل؟",
          options: {
            en: ["Bismillah", "Alhamdulillah", "SubhanAllah", "Allahu Akbar"],
            ar: ["بسم الله", "الحمد لله", "سبحان الله", "الله أكبر"],
          },
          correct: "0",
          explanation: {
            en: 'We say "Bismillah" (In the name of Allah) before eating.',
            ar: 'نقول "بسم الله" قبل الأكل.',
          },
        },
        {
          en: "It is Sunnah to eat with the right hand.",
          ar: "من السنة الأكل باليد اليمنى.",
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "true",
          explanation: {
            en: "Correct! The Prophet ﷺ taught us to eat with the right hand.",
            ar: "صحيح! علمنا النبي ﷺ أن نأكل باليد اليمنى.",
          },
        },
        {
          en: "What should you say when entering the bathroom?",
          ar: "ماذا تقول عند دخول الحمام؟",
          options: {
            en: [
              "Bismillah",
              "Allahumma inni...",
              "Alhamdulillah",
              "SubhanAllah",
            ],
            ar: ["بسم الله", "اللهم إني...", "الحمد لله", "سبحان الله"],
          },
          correct: "1",
          explanation: {
            en: 'We say "Allahumma inni a\'udhu bika..." (O Allah, I seek refuge in You...).',
            ar: 'نقول "اللهم إني أعوذ بك من الخبث والخبائث".',
          },
        },
      ],
    },
    {
      title: { en: "Good Character (Akhlaq)", ar: "الأخلاق الحسنة" },
      description: {
        en: "Understanding the importance of good character and manners in Islam.",
        ar: "فهم أهمية الأخلاق الحسنة والآداب في الإسلام.",
      },
      duration: 35,
      questions: [
        {
          en: "What did the Prophet ﷺ say is the heaviest thing on the scales?",
          ar: "ماذا قال النبي ﷺ هو أثقل شيء في الميزان؟",
          options: {
            en: ["Good character", "Prayer", "Fasting", "Charity"],
            ar: ["حسن الخلق", "الصلاة", "الصيام", "الصدقة"],
          },
          correct: "0",
          explanation: {
            en: "The Prophet ﷺ said good character is the heaviest on the scales.",
            ar: "قال النبي ﷺ إن حسن الخلق أثقل شيء في الميزان.",
          },
        },
        {
          en: "Smiling at your brother is charity.",
          ar: "التبسم في وجه أخيك صدقة.",
          type: "true_false",
          options: { en: ["True", "False"], ar: ["صحيح", "خطأ"] },
          correct: "true",
          explanation: {
            en: "Correct! The Prophet ﷺ said smiling is a form of charity.",
            ar: "صحيح! قال النبي ﷺ إن التبسم صدقة.",
          },
        },
        {
          en: "Which quality did the Prophet ﷺ have in the highest degree?",
          ar: "أي صفة كانت عند النبي ﷺ بأعلى درجة؟",
          options: {
            en: ["Truthfulness", "Generosity", "Patience", "All of the above"],
            ar: ["الصدق", "الكرم", "الصبر", "كل ما سبق"],
          },
          correct: "3",
          explanation: {
            en: "The Prophet ﷺ had all noble qualities in perfection.",
            ar: "كان النبي ﷺ يتمتع بجميع الصفات النبيلة بالكمال.",
          },
        },
      ],
    },
  ],
};

async function main() {
  console.log("🚀 Adding lessons to remaining branches...\n");

  const level1 = await prisma.level.findFirst({ where: { levelNumber: 1 } });
  if (!level1) {
    console.error("❌ Level 1 not found");
    return;
  }

  for (const [branchName, lessons] of Object.entries(branchLessons)) {
    const branch = await prisma.branch.findFirst({
      where: { nameEn: branchName },
    });
    if (!branch) {
      console.log(`⚠️  Branch "${branchName}" not found, skipping...`);
      continue;
    }

    const existing = await prisma.lesson.findMany({
      where: { branchId: branch.id, levelId: level1.id },
    });

    if (existing.length >= 3) {
      console.log(
        `✅ ${branchName}: Already has ${existing.length} lessons, skipping\n`
      );
      continue;
    }

    console.log(`📚 ${branchName}: Adding ${lessons.length} lessons...`);

    for (let i = 0; i < lessons.length; i++) {
      const lessonData = lessons[i];
      if (!lessonData) continue;

      const order = existing.length + i + 1;

      const lesson = await prisma.lesson.create({
        data: {
          branchId: branch.id,
          levelId: level1.id,
          titleEn: lessonData.title.en,
          titleAr: lessonData.title.ar,
          descriptionEn: lessonData.description.en,
          descriptionAr: lessonData.description.ar,
          videoUrlsEn: JSON.stringify([]),
          videoUrlsAr: JSON.stringify([]),
          duration: lessonData.duration,
          order,
        },
      });

      // Add questions
      for (let j = 0; j < lessonData.questions.length; j++) {
        const q = lessonData.questions[j];
        if (!q) continue;

        await prisma.question.create({
          data: {
            lessonId: lesson.id,
            questionTextEn: q.en,
            questionTextAr: q.ar,
            type: q.type || "multiple_choice",
            optionsEn: JSON.stringify(q.options.en),
            optionsAr: JSON.stringify(q.options.ar),
            correctAnswer: q.correct,
            explanationEn: q.explanation.en,
            explanationAr: q.explanation.ar,
            order: j + 1,
          },
        });
      }

      console.log(
        `  ✅ ${lessonData.title.en} (${lessonData.questions.length} questions)`
      );
    }
    console.log("");
  }

  console.log("🎉 All done! Level 1 content is now complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
