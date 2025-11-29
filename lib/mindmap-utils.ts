/**
 * Mind Map Utility Functions
 * Shared helper functions for the mind map system
 */

import type { NodeType, NodeShape } from "@/types/mindmap";

/**
 * Get the emoji icon for a node type
 */
export function getTypeIcon(type: NodeType | string): string {
  switch (type) {
    case "ROOT":
      return "🌳";
    case "CATEGORY":
      return "📁";
    case "TOPIC":
      return "📌";
    case "SUBTOPIC":
      return "📍";
    case "DETAIL":
      return "📝";
    case "NOTE":
      return "💡";
    case "EVENT":
      return "⭐";
    case "DECISION":
      return "⚖️";
    case "POLICY":
      return "📜";
    case "BATTLE":
      return "⚔️";
    case "TREATY":
      return "🤝";
    case "REVELATION":
      return "📖";
    case "MIRACLE":
      return "✨";
    case "LESSON":
      return "🎓";
    default:
      return "📌";
  }
}

/**
 * Get the emoji icon for a node shape
 */
export function getShapeIcon(shape: NodeShape | string): string {
  switch (shape) {
    case "circle":
      return "⭕";
    case "rect":
      return "▭";
    case "diamond":
      return "◆";
    default:
      return "⭕";
  }
}

/**
 * Safely parse a JSON string array
 * Returns an empty array if parsing fails or input is invalid
 */
export function parseJSONArray(jsonStr: string | undefined | null): string[] {
  if (!jsonStr || jsonStr === "[]" || jsonStr.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse JSON array:", error);
    return [];
  }
}

/**
 * Convert an array to a JSON string
 * Returns "[]" for empty arrays
 */
export function arrayToJSON(arr: string[]): string {
  if (!arr || arr.length === 0) {
    return "[]";
  }
  return JSON.stringify(arr);
}

/**
 * Check if a JSON string represents an empty array
 */
export function isEmptyJSONArray(jsonStr: string | undefined | null): boolean {
  if (!jsonStr) return true;
  const parsed = parseJSONArray(jsonStr);
  return parsed.length === 0;
}

/**
 * Get a human-readable label for a node type
 */
export function getTypeLabel(type: NodeType | string, locale: "ar" | "en"): string {
  const labels: Record<string, { ar: string; en: string }> = {
    ROOT: { ar: "جذر", en: "Root" },
    CATEGORY: { ar: "فئة", en: "Category" },
    TOPIC: { ar: "موضوع", en: "Topic" },
    SUBTOPIC: { ar: "موضوع فرعي", en: "Subtopic" },
    DETAIL: { ar: "تفصيل", en: "Detail" },
    NOTE: { ar: "ملاحظة", en: "Note" },
    EVENT: { ar: "حدث", en: "Event" },
    DECISION: { ar: "قرار", en: "Decision" },
    POLICY: { ar: "سياسة", en: "Policy" },
    BATTLE: { ar: "معركة", en: "Battle" },
    TREATY: { ar: "معاهدة", en: "Treaty" },
    REVELATION: { ar: "وحي", en: "Revelation" },
    MIRACLE: { ar: "معجزة", en: "Miracle" },
    LESSON: { ar: "درس", en: "Lesson" },
  };

  return labels[type]?.[locale] || type;
}

/**
 * Validate if a string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format a date string for display
 * Handles both Hijri and Gregorian dates
 */
export function formatDate(
  dateHijri?: string,
  dateGregorian?: string,
  locale: "ar" | "en" = "en"
): string {
  const parts: string[] = [];

  if (dateHijri) {
    const prefix = locale === "ar" ? "هـ:" : "AH:";
    parts.push(`${prefix} ${dateHijri}`);
  }

  if (dateGregorian) {
    const prefix = locale === "ar" ? "م:" : "CE:";
    parts.push(`${prefix} ${dateGregorian}`);
  }

  return parts.join(" • ");
}

