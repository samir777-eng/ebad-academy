# 🧪 Feature Testing Checklist - Ebad Academy

## Pre-Testing Setup

- [ ] Development server running (`npm run dev`)
- [ ] Database populated with Level 1 content (18 lessons, 64 questions)
- [ ] Test accounts created:
  - Student: `student@test.com` / `student123`
  - Admin: `admin@example.com` / `admin123`

---

## 1. ✅ Video Lesson Support

### Test Steps:
- [ ] Navigate to any lesson with videos
- [ ] Play video in iframe player
- [ ] Add a timestamp note during video playback
- [ ] Jump to saved timestamp
- [ ] Verify timestamp list displays correctly
- [ ] Test with both English and Arabic lessons

**Expected Result:** Videos play smoothly, timestamps save and work correctly

---

## 2. ✅ PDF Resources

### Test Steps:
- [ ] Navigate to a lesson with PDF
- [ ] View PDF in iframe viewer
- [ ] Download PDF using download button
- [ ] Verify PDF opens correctly
- [ ] Test on both desktop and mobile views

**Expected Result:** PDF displays in viewer and downloads successfully

---

## 3. ✅ Student Notes & Bookmarks

### Test Steps:
- [ ] Open any lesson
- [ ] Write notes in the Notes tab
- [ ] Wait 2 seconds for auto-save
- [ ] Refresh page and verify notes persist
- [ ] Click bookmark icon to save lesson
- [ ] Navigate to `/en/bookmarks` page
- [ ] Verify bookmarked lesson appears
- [ ] Remove bookmark and verify it disappears

**Expected Result:** Notes auto-save, bookmarks work correctly

---

## 4. ✅ Action Items & Tasks

### Test Steps:
- [ ] Navigate to lesson with action items
- [ ] View Action Items tab
- [ ] Check off action items
- [ ] Verify progress bar updates
- [ ] Refresh page and verify completion persists
- [ ] Test with Arabic version

**Expected Result:** Action items track completion correctly

---

## 5. ✅ Spiritual Progress Tracker

### Test Steps:
- [ ] Navigate to `/en/spiritual-progress`
- [ ] Mark prayers as completed (Fajr, Dhuhr, Asr, Maghrib, Isha)
- [ ] Add Quran reading (pages and minutes)
- [ ] Mark fasting
- [ ] Add charity amount
- [ ] Add dhikr count
- [ ] Save progress
- [ ] View calendar to see progress history
- [ ] Check statistics dashboard
- [ ] Test date navigation (previous/next day)

**Expected Result:** All spiritual activities track correctly with visual feedback

---

## 6. ✅ Badges & Achievements

### Test Steps:
- [ ] Complete first lesson
- [ ] Check if "First Steps" badge awarded
- [ ] Complete all lessons in a branch
- [ ] Check if branch completion badge awarded
- [ ] Get 100% on a quiz
- [ ] Check if "Perfect Score" badge awarded
- [ ] View all badges in profile/dashboard
- [ ] Test as admin: create new badge

**Expected Result:** Badges automatically awarded based on achievements

---

## 7. ✅ Interactive Mind Maps

### Test Steps:
- [ ] Navigate to lesson with mind map data
- [ ] View Mind Map tab
- [ ] Expand/collapse nodes
- [ ] Verify hierarchical structure displays
- [ ] Check color coding by level
- [ ] Test with Arabic content

**Expected Result:** Mind map displays as interactive tree with expand/collapse

---

## 8. ✅ Certificate Generation

### Test Steps:
- [ ] Complete ALL lessons in Level 1 (18 lessons)
- [ ] Pass all quizzes with ≥60% score
- [ ] Verify Level 2 unlocks
- [ ] Navigate to certificate page or trigger certificate generation
- [ ] Generate certificate for Level 1
- [ ] Verify certificate displays:
  - Student name
  - Level number and name
  - Completion date
  - Statistics (lessons completed, average score)
  - Certificate ID
- [ ] Download certificate as HTML
- [ ] Test share functionality
- [ ] Test with Arabic locale

**Expected Result:** Certificate generates with correct data and downloads successfully

---

## 9. ✅ Enhanced Analytics

### Admin Analytics:
- [ ] Login as admin (`admin@example.com` / `admin123`)
- [ ] Navigate to `/en/admin/analytics`
- [ ] Verify dashboard shows:
  - Total users count
  - Total lessons count
  - Quiz attempts and pass rate
  - Active users
- [ ] Check user growth chart (30 days)
- [ ] Check quiz score distribution chart
- [ ] Check level completion rates
- [ ] Check popular lessons ranking

### Student Analytics:
- [ ] Login as student
- [ ] Navigate to dashboard
- [ ] Verify personal progress shows:
  - Overall progress percentage
  - Branch-wise progress
  - Recent activity
  - Next lesson recommendation

**Expected Result:** All analytics display correctly with accurate data

---

## 10. ✅ Discussion Forums

### Test Steps:
- [ ] Navigate to any lesson
- [ ] Click on Discussions tab (if integrated)
- [ ] Create new discussion/question
- [ ] Verify discussion appears in list
- [ ] Test pinning discussion (admin only)
- [ ] Test marking as resolved
- [ ] Add reply to discussion
- [ ] Like a discussion
- [ ] Test with Arabic interface

**Expected Result:** Discussion forum allows Q&A with proper threading

---

## 🌐 Bilingual Testing

### English Version:
- [ ] All pages load correctly at `/en/*`
- [ ] All text displays in English
- [ ] LTR layout works properly
- [ ] Forms submit correctly

### Arabic Version:
- [ ] All pages load correctly at `/ar/*`
- [ ] All text displays in Arabic
- [ ] RTL layout works properly
- [ ] Navbar positioned on right
- [ ] Forms submit correctly with RTL input

---

## 📱 Responsive Design Testing

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All features work on mobile
- [ ] Navigation menu works on mobile
- [ ] Forms are usable on mobile

---

## 🔐 Authentication & Authorization

- [ ] Student can login
- [ ] Student can access lessons
- [ ] Student CANNOT access admin pages
- [ ] Admin can login
- [ ] Admin can access admin dashboard
- [ ] Admin can view analytics
- [ ] Admin can manage lessons
- [ ] Logout works correctly

---

## 🎯 Complete User Journey

### New Student Journey:
1. [ ] Register new account
2. [ ] Login successfully
3. [ ] View dashboard (only Level 1 unlocked)
4. [ ] Select a branch (e.g., Aqeedah)
5. [ ] Complete Lesson 1
6. [ ] Take quiz and pass (≥60%)
7. [ ] Verify progress updates
8. [ ] Complete all 3 Aqeedah lessons
9. [ ] Repeat for all 6 branches
10. [ ] Complete all 18 Level 1 lessons
11. [ ] Verify Level 2 unlocks
12. [ ] Generate Level 1 certificate
13. [ ] Check badges earned

---

## 🐛 Known Issues to Check

- [ ] No console errors in browser
- [ ] No 404 errors for resources
- [ ] No database connection errors
- [ ] Images load correctly
- [ ] Videos load correctly
- [ ] API responses are fast (<500ms)

---

## ✅ Final Verification

- [ ] All 10 features working
- [ ] Both languages working
- [ ] Mobile responsive
- [ ] No critical bugs
- [ ] Ready for production deployment

---

**Testing Date:** _____________
**Tested By:** _____________
**Status:** ⬜ Pass | ⬜ Fail | ⬜ Needs Fixes

