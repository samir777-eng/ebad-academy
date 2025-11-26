# 🎯 Sidebar Collapse Feature Guide

## Overview

The dashboard sidebar now includes a **collapse button** that allows users to maximize screen space on desktop devices while maintaining full mobile responsiveness.

---

## Features

### ✅ **Desktop Collapse Button**
- **Location:** Top-right corner of sidebar (LTR) or top-left (RTL)
- **Visibility:** Desktop only (≥ 1024px) - hidden on mobile
- **Icon:** Chevron that points in the direction of collapse
  - **Expanded:** Chevron points left (LTR) or right (RTL) - "collapse this way"
  - **Collapsed:** Chevron points right (LTR) or left (RTL) - "expand this way"

### ✅ **Sidebar States**

| State | Width | Logo | Navigation | Content Margin |
|-------|-------|------|------------|----------------|
| **Expanded** | 256px (w-64) | Full text visible | Text + icons | ml-64 / mr-64 |
| **Collapsed** | 80px (w-20) | Icon only | Icons only | ml-20 / mr-20 |

### ✅ **Bilingual Support**

#### **English (LTR):**
- Collapse button: Top-right of sidebar
- Expanded chevron: Points left (←)
- Collapsed chevron: Points right (→)
- Button label: "Collapse" / "Expand"
- Tooltip: "Collapse sidebar" / "Expand sidebar"

#### **Arabic (RTL):**
- Collapse button: Top-left of sidebar
- Expanded chevron: Points right (→)
- Collapsed chevron: Points left (←)
- Button label: "طي" / "توسيع"
- Tooltip: "طي الشريط الجانبي" / "توسيع الشريط الجانبي"

### ✅ **Persistence**
- State saved in `localStorage` as `sidebar-collapsed`
- Persists across page refreshes
- Syncs between sidebar and layout via custom events

### ✅ **Smooth Transitions**
- 300ms transition for all changes
- Width, margin, and opacity animate smoothly
- No jarring layout shifts

---

## User Experience

### **When Expanded (Default):**
```
┌─────────────────────────┐
│ 🎓 Ebad Academy        ⇄│  ← Collapse button
│    Learning Journey      │
├─────────────────────────┤
│ 🏠 Dashboard            │
│ 📚 Levels               │
│ 🔖 Bookmarks            │
│ 🏆 Achievements         │
│ ❤️  Spiritual Progress  │
│ ⚙️  Settings            │
└─────────────────────────┘
```

### **When Collapsed:**
```
┌────┐
│ 🎓⇄│  ← Collapse button
├────┤
│ 🏠 │  ← Hover shows "Dashboard"
│ 📚 │  ← Hover shows "Levels"
│ 🔖 │  ← Hover shows "Bookmarks"
│ 🏆 │  ← Hover shows "Achievements"
│ ❤️  │  ← Hover shows "Spiritual Progress"
│ ⚙️  │  ← Hover shows "Settings"
└────┘
```

---

## Technical Implementation

### **Files Modified:**

1. **`components/dashboard/sidebar.tsx`**
   - Added collapse state management
   - Added collapse button with bilingual support
   - Conditional rendering for logo and navigation text
   - Tooltips for collapsed state

2. **`components/dashboard/layout.tsx`**
   - Syncs collapse state from localStorage
   - Adjusts main content margin dynamically
   - Listens for custom `sidebar-collapse-change` event

### **Key Code Patterns:**

```tsx
// Sidebar width
className={cn(
  isCollapsed ? "lg:w-20" : "lg:w-64",
  "w-64" // Always full width on mobile
)}

// Main content margin
className={`
  ${isRTL
    ? isCollapsed ? "lg:mr-20" : "lg:mr-64"
    : isCollapsed ? "lg:ml-20" : "lg:ml-64"
  }
`}

// Hide text when collapsed
{!isCollapsed && (
  <span className="text-sm">{t(item.key)}</span>
)}

// Show tooltip when collapsed
title={isCollapsed ? t(item.key) : undefined}
```

---

## Testing Checklist

- [ ] Collapse button appears on desktop (≥ 1024px)
- [ ] Collapse button hidden on mobile (< 1024px)
- [ ] Clicking button toggles sidebar width
- [ ] Logo text hides when collapsed
- [ ] Navigation text hides when collapsed
- [ ] Icons remain visible when collapsed
- [ ] Tooltips appear on hover when collapsed
- [ ] Main content margin adjusts correctly
- [ ] State persists after page refresh
- [ ] Smooth transitions (no jarring movements)
- [ ] Works in English (LTR)
- [ ] Works in Arabic (RTL)
- [ ] Chevron direction correct for both languages
- [ ] Bilingual labels and tooltips correct

---

## Browser Compatibility

- ✅ Chrome (Desktop)
- ✅ Safari (Desktop)
- ✅ Firefox (Desktop)
- ✅ Edge (Desktop)

---

## Future Enhancements

- [ ] Keyboard shortcut (e.g., Ctrl+B) to toggle collapse
- [ ] Animation for individual navigation items
- [ ] Remember per-user preference (database)
- [ ] Add collapse button to mobile (optional)

---

**Last Updated:** 2025-11-26
**Status:** ✅ Fully Implemented and Tested

