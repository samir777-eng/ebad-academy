import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample Islamic educational videos (YouTube embeds)
// These are placeholder URLs - replace with actual Islamic educational content
const sampleVideos = {
  aqeedah: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Aqeedah video
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Tawheed video
  ],
  fiqh: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Fiqh video
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Wudu video
  ],
  seerah: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Seerah video
  ],
  tafseer: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Tafseer video
  ],
  hadith: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Hadith video
  ],
  tarbiyah: [
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual Tarbiyah video
  ],
};

async function main() {
  console.log('🎥 Adding sample video URLs to lessons...\n');

  const branches = await prisma.branch.findMany({
    include: {
      lessons: {
        where: { levelId: 1 },
        orderBy: { order: 'asc' },
      }
    }
  });

  for (const branch of branches) {
    console.log(`📚 ${branch.nameEn}:`);
    
    let videoKey: keyof typeof sampleVideos;
    if (branch.slug === 'aqeedah') videoKey = 'aqeedah';
    else if (branch.slug === 'fiqh') videoKey = 'fiqh';
    else if (branch.slug === 'seerah') videoKey = 'seerah';
    else if (branch.slug === 'tafseer') videoKey = 'tafseer';
    else if (branch.slug === 'hadith') videoKey = 'hadith';
    else if (branch.slug === 'tarbiyah') videoKey = 'tarbiyah';
    else continue;

    const videos = sampleVideos[videoKey];

    for (const lesson of branch.lessons) {
      // Add 1-2 videos per lesson
      const lessonVideos = videos.slice(0, Math.min(2, videos.length));
      
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          videoUrlsEn: JSON.stringify(lessonVideos),
          videoUrlsAr: JSON.stringify(lessonVideos), // Same videos for now
        }
      });

      console.log(`  ✅ ${lesson.titleEn} - Added ${lessonVideos.length} video(s)`);
    }
    console.log('');
  }

  console.log('🎉 Sample videos added! Replace placeholder URLs with actual Islamic content.\n');
  console.log('📝 Note: Current URLs are placeholders. Update them with:');
  console.log('   - Authentic Islamic educational videos');
  console.log('   - YouTube/Vimeo embed URLs');
  console.log('   - Bilingual content (Arabic & English)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

