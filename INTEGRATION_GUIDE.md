# 🔧 Integration Guide - New Features

This guide explains how to integrate the newly added features into your existing pages.

---

## 1. Certificate Generation

### Add to Level Completion Modal/Page:

```tsx
import { CertificateViewer } from "@/components/certificate/certificate-viewer";

// In your level completion component:
<CertificateViewer levelNumber={1} locale={locale} />
```

### Usage:
- Shows "Generate Certificate" button
- Validates level completion before generating
- Displays beautiful certificate with student details
- Allows download as HTML file
- Includes share functionality

---

## 2. Discussion Forums

### Add to Lesson Page:

```tsx
import { LessonDiscussion } from "@/components/discussion/lesson-discussion";

// In your lesson viewer, add a new tab:
<LessonDiscussion lessonId={lesson.id} locale={locale} />
```

### Before Using:
1. **Add discussion models to `prisma/schema.prisma`:**
   - Copy content from `prisma/schema-discussion.prisma`
   - Add to main schema file
   - Run `npx prisma db push`

2. **Create API routes:**
   - `/api/discussion/route.ts` - List and create discussions
   - `/api/discussion/[id]/route.ts` - Get, update, delete discussion
   - `/api/discussion/[id]/reply/route.ts` - Add replies
   - `/api/discussion/[id]/like/route.ts` - Like/unlike

---

## 3. Video URLs

### Add Sample Videos to Lessons:

```bash
npx tsx scripts/add-sample-videos.ts
```

This adds placeholder YouTube URLs. Replace with actual Islamic educational content.

### Manual Addition:

```typescript
await prisma.lesson.update({
  where: { id: lessonId },
  data: {
    videoUrlsEn: JSON.stringify([
      "https://www.youtube.com/embed/VIDEO_ID_1",
      "https://www.youtube.com/embed/VIDEO_ID_2"
    ]),
    videoUrlsAr: JSON.stringify([
      "https://www.youtube.com/embed/ARABIC_VIDEO_ID"
    ])
  }
});
```

---

## 4. PDF Resources

### Add PDF to Lesson:

```typescript
await prisma.lesson.update({
  where: { id: lessonId },
  data: {
    pdfUrlEn: "https://your-cdn.com/lesson-1-en.pdf",
    pdfUrlAr: "https://your-cdn.com/lesson-1-ar.pdf"
  }
});
```

**Note:** Upload PDFs to a CDN (Vercel Blob, AWS S3, etc.) and use the URL.

---

## 5. Mind Map Data

### Add Mind Map to Lesson:

```typescript
const mindMapData = {
  id: "root",
  title: "Islamic Creed (Aqeedah)",
  titleAr: "العقيدة الإسلامية",
  children: [
    {
      id: "1",
      title: "Belief in Allah",
      titleAr: "الإيمان بالله",
      children: [
        {
          id: "1-1",
          title: "Oneness of Allah (Tawheed)",
          titleAr: "توحيد الله"
        }
      ]
    }
  ]
};

await prisma.lesson.update({
  where: { id: lessonId },
  data: {
    mindmapData: JSON.stringify(mindMapData)
  }
});
```

---

## 6. Action Items

### Add Action Items to Lesson:

```typescript
const actionItemsEn = [
  "Memorize the 6 Pillars of Iman",
  "Reflect on your belief in Allah",
  "Pray 5 daily prayers on time"
];

const actionItemsAr = [
  "احفظ أركان الإيمان الستة",
  "تأمل في إيمانك بالله",
  "صلِّ الصلوات الخمس في وقتها"
];

await prisma.lesson.update({
  where: { id: lessonId },
  data: {
    actionItemsEn: JSON.stringify(actionItemsEn),
    actionItemsAr: JSON.stringify(actionItemsAr)
  }
});
```

---

## 7. Badges

### Create New Badge (Admin):

```typescript
await prisma.badge.create({
  data: {
    nameEn: "Aqeedah Master",
    nameAr: "متقن العقيدة",
    descriptionEn: "Complete all Aqeedah lessons",
    descriptionAr: "أتم جميع دروس العقيدة",
    iconUrl: "/badges/aqeedah-master.svg",
    criteria: JSON.stringify({
      type: "branch_completed",
      branchId: 1 // Aqeedah branch
    })
  }
});
```

### Badge Criteria Types:
- `lessons_completed` - Complete X lessons
- `level_completed` - Complete a specific level
- `perfect_score` - Get 100% on X quizzes
- `streak` - Complete lessons X days in a row
- `branch_completed` - Complete all lessons in a branch

---

## 8. Analytics

### Already Integrated!
- Admin: `/[locale]/admin/analytics`
- Student: Dashboard shows personal analytics

No additional integration needed.

---

## 9. Spiritual Progress

### Already Integrated!
- Page: `/[locale]/spiritual-progress`
- Component: `SpiritualProgressDashboard`

No additional integration needed.

---

## 10. Notes & Bookmarks

### Already Integrated!
- Notes: Auto-save in lesson viewer
- Bookmarks: `/[locale]/bookmarks`

No additional integration needed.

---

## Quick Start Checklist

- [ ] Run `npx tsx scripts/add-sample-videos.ts` to add video URLs
- [ ] Upload PDF files to CDN and update lesson records
- [ ] Create mind map data for complex lessons
- [ ] Add action items to lessons
- [ ] Create initial badges for achievements
- [ ] Add discussion models to schema (if using forums)
- [ ] Test certificate generation after completing Level 1
- [ ] Verify all features work in both English and Arabic

---

## Database Updates Required

### For Discussion Forums:
```bash
# 1. Copy models from schema-discussion.prisma to schema.prisma
# 2. Push to database
npx prisma db push

# 3. Verify models created
npx prisma studio
```

---

## Environment Variables

No new environment variables needed! All features use existing configuration.

---

## Next Steps

1. **Test all features** using `FEATURE_TESTING_CHECKLIST.md`
2. **Add real content** (videos, PDFs, mind maps)
3. **Create badges** for student motivation
4. **Deploy to production** when ready

---

**Questions?** Check the main README.md or TESTING_GUIDE.md

