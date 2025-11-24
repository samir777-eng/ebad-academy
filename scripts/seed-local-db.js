#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding local database...');

  // Create levels
  console.log('Creating levels...');
  const levels = await Promise.all([
    prisma.level.upsert({
      where: { levelNumber: 1 },
      update: {},
      create: {
        levelNumber: 1,
        nameAr: 'المستوى الأول',
        nameEn: 'Level 1',
        descriptionAr: 'الأساسيات',
        descriptionEn: 'Fundamentals',
        order: 1,
      },
    }),
    prisma.level.upsert({
      where: { levelNumber: 2 },
      update: {},
      create: {
        levelNumber: 2,
        nameAr: 'المستوى الثاني',
        nameEn: 'Level 2',
        descriptionAr: 'التعمق',
        descriptionEn: 'Intermediate',
        order: 2,
      },
    }),
    prisma.level.upsert({
      where: { levelNumber: 3 },
      update: {},
      create: {
        levelNumber: 3,
        nameAr: 'المستوى الثالث',
        nameEn: 'Level 3',
        descriptionAr: 'التخصص',
        descriptionEn: 'Advanced',
        order: 3,
      },
    }),
    prisma.level.upsert({
      where: { levelNumber: 4 },
      update: {},
      create: {
        levelNumber: 4,
        nameAr: 'المستوى الرابع',
        nameEn: 'Level 4',
        descriptionAr: 'الإتقان',
        descriptionEn: 'Mastery',
        order: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${levels.length} levels`);

  // Create branches
  console.log('Creating branches...');
  const branches = [
    { nameAr: 'العقيدة', nameEn: 'Aqeedah', icon: '🕌', slug: 'aqeedah', order: 1 },
    { nameAr: 'الفقه', nameEn: 'Fiqh', icon: '📖', slug: 'fiqh', order: 2 },
    { nameAr: 'السيرة', nameEn: 'Seerah', icon: '📚', slug: 'seerah', order: 3 },
    { nameAr: 'التفسير', nameEn: 'Tafseer', icon: '📕', slug: 'tafseer', order: 4 },
    { nameAr: 'الحديث', nameEn: 'Hadith', icon: '📜', slug: 'hadith', order: 5 },
    { nameAr: 'التربية', nameEn: 'Tarbiyah', icon: '💎', slug: 'tarbiyah', order: 6 },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { slug: branch.slug },
      update: {},
      create: branch,
    });
  }

  console.log(`✅ Created ${branches.length} branches`);

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@local.dev' },
    update: {},
    create: {
      email: 'admin@local.dev',
      name: 'Local Admin',
      idNumber: 'EA000000001',
      phoneNumber: '+1234567890',
      password: hashedPassword,
      role: 'admin',
      languagePref: 'ar',
    },
  });

  console.log('✅ Created admin user: admin@local.dev / admin123');

  // Unlock Level 1 for admin
  const level1 = levels[0];
  await prisma.userLevelStatus.upsert({
    where: {
      userId_levelId: {
        userId: admin.id,
        levelId: level1.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      levelId: level1.id,
      isUnlocked: true,
      unlockedAt: new Date(),
    },
  });

  console.log('✅ Unlocked Level 1 for admin');

  console.log('\n🎉 Local database seeded successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@local.dev');
  console.log('   Password: admin123');
  console.log('\n🚀 Start the dev server: npm run dev');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

