# Testing Guide - Ebad Academy

## 🎯 Current Status

### ✅ Phase 2 Complete: Sample Content Added

We've successfully added sample lessons to Level 1, Aqeedah branch:

**Aqeedah (Islamic Creed) - Level 1:**
1. **Introduction to Islamic Creed** (15 questions)
2. **The Oneness of Allah (Tawheed)** (5 questions)
3. **The Six Pillars of Iman (Faith)** (5 questions)

**Total:** 3 lessons, 25 quiz questions

## 🧪 Testing the Complete User Journey

### Step 1: Access the Application

1. Make sure the dev server is running:
   ```bash
   npm run dev
   ```

2. Open browser: http://localhost:3000

### Step 2: Test Student Account

**Login Credentials:**
- **Email:** `student@test.com`
- **Password:** `student123`

**Admin Account (for content management):**
- **Email:** `admin@local.dev`
- **Password:** `admin123`

### Step 3: Complete User Flow Test

#### A. Registration & Login
- [ ] Navigate to `/en/login`
- [ ] Login with student credentials
- [ ] Verify dashboard loads correctly
- [ ] Check that Level 1 is unlocked by default

#### B. Lesson Progression
- [ ] Navigate to Aqeedah branch
- [ ] Open "Introduction to Islamic Creed" lesson
- [ ] Complete the lesson (mark as read)
- [ ] Take the quiz (15 questions)
- [ ] Verify score is calculated correctly
- [ ] Check that lesson shows as completed

#### C. Quiz System
- [ ] Answer all questions in the quiz
- [ ] Verify immediate feedback on answers
- [ ] Check explanations appear for each question
- [ ] Confirm score ≥60% to pass
- [ ] Verify progress is saved

#### D. Level Progression
- [ ] Complete all 3 Aqeedah lessons
- [ ] Verify progress percentage updates
- [ ] Check if Level 2 unlocks (requires 100% completion of all branches)

#### E. Arabic/English Toggle
- [ ] Switch language to Arabic (`/ar/dashboard`)
- [ ] Verify all content displays in Arabic
- [ ] Check RTL layout works correctly
- [ ] Switch back to English

### Step 4: Admin Panel Testing

Login as admin and verify:

- [ ] Can access `/en/admin/lessons`
- [ ] Can view all lessons
- [ ] Can edit existing lessons
- [ ] Can create new lessons
- [ ] Can add/edit quiz questions

## 📊 Database Verification

### Check Lesson Count
```bash
npx tsx scripts/check-lessons.ts
```

Expected output:
```
📚 Aqeedah Level 1 Lessons: 3

1. Introduction to Islamic Creed (Order: 1)
   Questions: 15

2. The Oneness of Allah (Tawheed) (Order: 2)
   Questions: 5

3. The Six Pillars of Iman (Faith) (Order: 3)
   Questions: 5
```

### Open Prisma Studio
```bash
npx prisma studio
```

Navigate to:
- `Lesson` table - verify 8 lessons total (6 intro + 2 new Aqeedah)
- `Question` table - verify questions exist
- `User` table - verify test student exists

## 🐛 Known Issues to Test

1. **Level Unlocking:** Verify that Level 2 only unlocks after completing ALL branches in Level 1
2. **Quiz Retakes:** Test that users can retake quizzes if they fail (score < 60%)
3. **Progress Tracking:** Ensure progress persists across sessions
4. **Spiritual Progress:** Test prayer tracking, Quran reading, etc.

## 🚀 Next Steps After Testing

If all tests pass:

1. **Expand to Other Branches:**
   - Add 2-3 lessons for Fiqh
   - Add 2-3 lessons for Seerah
   - Add 2-3 lessons for Tafseer
   - Add 2-3 lessons for Hadith
   - Add 2-3 lessons for Tarbiyah

2. **Add Multimedia Content:**
   - Upload video lessons
   - Add PDF resources
   - Create mind maps

3. **Deploy to Production:**
   - Test on preview deployment
   - Verify production database migration
   - Update production content

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

✅ Registration & Login: PASS / FAIL
✅ Lesson Viewing: PASS / FAIL
✅ Quiz Taking: PASS / FAIL
✅ Progress Tracking: PASS / FAIL
✅ Language Toggle: PASS / FAIL
✅ Admin Panel: PASS / FAIL

Notes:
_________________________________
_________________________________
```

## 🔧 Troubleshooting

### Issue: Lessons not showing
**Solution:** Run `npx tsx scripts/check-lessons.ts` to verify database

### Issue: Quiz not loading
**Solution:** Check browser console for errors, verify questions exist in database

### Issue: Login fails
**Solution:** Verify user exists with `npx prisma studio`, check password hash

### Issue: Progress not saving
**Solution:** Check `UserProgress` table in Prisma Studio, verify API calls in Network tab

