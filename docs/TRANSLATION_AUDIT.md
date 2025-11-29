# Translation Audit Report

**Date:** 2025-11-29  
**Status:** In Progress  
**Goal:** Find and translate all hardcoded English strings to support complete i18n

---

## 🔍 Audit Methodology

1. Search for hardcoded English strings in JSX/TSX files
2. Identify strings that should be translated
3. Add missing translations to `messages/en.json` and `messages/ar.json`
4. Update components to use `useTranslations()` hook
5. Verify RTL layout for Arabic

---

## 📋 Hardcoded Strings Found

### Admin Pages

**File: `app/[locale]/admin/page.tsx`**
- ❌ "Total Users"
- ❌ "Total Lessons"
- ❌ "Total Questions"
- ❌ "Total Levels"
- ❌ "Manage Lessons"
- ❌ "Create, edit, and delete lessons"
- ❌ "Manage Users"
- ❌ "View and manage user accounts"
- ❌ "View Analytics"
- ❌ "Track platform performance and engagement"
- ❌ "Manage Badges"
- ❌ "Create and manage achievement badges"

**File: `app/[locale]/admin/badges/page.tsx`**
- ❌ "Edit badge"
- ❌ "Manually assigned"
- ❌ "Manual"
- ❌ "Auto"

**File: `app/[locale]/admin/users/[id]/page.tsx`**
- ❌ "Passed"
- ❌ "Failed"

### User-Facing Pages

**File: `app/[locale]/achievements/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Dashboard"
- ❌ "Achievements"
- ❌ "Earned on"
- ❌ "No badges available yet"

**File: `app/[locale]/quiz-history/[lessonId]/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Back to Lesson"
- ❌ "Quiz History"
- ❌ "No quiz attempts yet"
- ❌ "Attempt"
- ❌ "Score"
- ❌ "Correct Answers"
- ❌ "Date"
- ❌ "Review"

**File: `app/[locale]/quiz-review/[attemptId]/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Back to History"
- ❌ "Quiz Review"
- ❌ "Score"
- ❌ "Status"
- ❌ "Passed" / "Failed"
- ❌ "Correct"
- ❌ "Date"
- ❌ "Questions Review"
- ❌ "Question"
- ❌ "Correct" / "Incorrect"
- ❌ "True" / "False"
- ❌ "Explanation:"

**File: `app/[locale]/leaderboard/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Dashboard"
- ❌ "Leaderboard"
- ❌ "Compete with your peers in the learning journey"
- ❌ "Your Current Rank"
- ❌ "Total Points"
- ❌ "Scoring System"
- ❌ "Points per Lesson"
- ❌ "Points per Quiz"
- ❌ "Points per Badge"
- ❌ "Points per Level"
- ❌ "Anonymous" (for users without names)

**File: `app/[locale]/dashboard/bookmarks/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Bookmarked Lessons"
- ❌ "Completed"
- ❌ "No Bookmarked Lessons"
- ❌ "Save your favorite lessons for quick access"
- ❌ "Browse Lessons"

**File: `app/[locale]/dashboard/levels/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Dashboard"
- ❌ "My Levels"
- ❌ "Failed to fetch levels" (error message)

**File: `app/[locale]/dashboard/spiritual-progress/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Spiritual Progress"
- ❌ "Track your daily worship and good deeds"

**File: `app/[locale]/dashboard/page.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Loading..."
- ❌ "Selected Level"
- ❌ "View All Levels"
- ❌ "Failed to fetch stats" (error message)
- ❌ "Failed to fetch level stats" (error message)

### Components

**File: `components/ui/pagination.tsx`**
- ❌ "Previous" / "Next" (currently using isRTL ternary)

**File: `components/certificate/certificate-viewer.tsx`**
- ✅ Using isRTL ternary (needs translation keys)
- ❌ "Try Again"
- ❌ "Get your level completion certificate"
- ❌ "Generating..."
- ❌ "Generate Certificate"
- ❌ "Certificate of Completion"
- ❌ "Ebad Academy"
- ❌ "This certifies that"
- ❌ "Failed to generate certificate" (error message)

### Auth Pages

**File: `app/[locale]/register/page.tsx`**
- ❌ "Registration failed" (error message)
- ❌ "An error occurred. Please try again." (error message)
- ❌ "Hide password" / "Show password" (aria-label)

**File: `app/[locale]/login/page.tsx`**
- ❌ "Too many login attempts. Please try again later." (error message)
- ❌ "Hide password" / "Show password" (aria-label)

---

## 📊 Summary

**Total Hardcoded Strings Found:** ~100+

**Categories:**
1. **Admin Interface:** ~15 strings
2. **User Dashboard:** ~30 strings
3. **Quiz/Review Pages:** ~25 strings
4. **Leaderboard:** ~12 strings
5. **Components:** ~10 strings
6. **Error Messages:** ~8 strings
7. **Auth Pages:** ~5 strings

---

## ✅ Action Plan

1. Add all missing translations to `messages/en.json`
2. Add corresponding Arabic translations to `messages/ar.json`
3. Update components to use `useTranslations()` hook
4. Replace `isRTL ? "Arabic" : "English"` with `t('key')`
5. Test all pages in both languages
6. Verify RTL layout

---

**Next Steps:** Add missing translation keys to message files

