// @ts-ignore - moment-hijri doesn't have types
import moment from "moment-hijri";

/**
 * Date utilities for handling both Hijri and Gregorian dates
 * Supports parsing, formatting, validation, and conversion
 */

export interface DateRange {
  start: string;
  end: string;
}

/**
 * Format a Hijri date for display
 * @param hijriDate - Hijri date string (e.g., "12 Rabi' al-Awwal 1 AH")
 * @param locale - Language locale ("ar" or "en")
 * @returns Formatted date string
 */
export function formatHijriDate(
  hijriDate: string,
  locale: string = "en"
): string {
  if (!hijriDate) return "";

  try {
    // Try to parse the date
    const m = moment(hijriDate, "iDD iMMMM iYYYY");
    if (m.isValid()) {
      return locale === "ar"
        ? m.format("iDD iMMMM iYYYY هـ")
        : m.format("iDD iMMMM iYYYY AH");
    }
    // If parsing fails, return original
    return hijriDate;
  } catch {
    return hijriDate;
  }
}

/**
 * Format a Gregorian date for display
 * @param gregorianDate - Gregorian date string (e.g., "622 CE")
 * @returns Formatted date string
 */
export function formatGregorianDate(gregorianDate: string): string {
  if (!gregorianDate) return "";
  return gregorianDate;
}

/**
 * Convert Hijri date to Gregorian
 * @param hijriDate - Hijri date string
 * @returns Gregorian date string or null if invalid
 */
export function hijriToGregorian(hijriDate: string): string | null {
  if (!hijriDate) return null;

  try {
    const m = moment(hijriDate, "iDD iMMMM iYYYY");
    if (m.isValid()) {
      return m.format("DD MMMM YYYY");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert Gregorian date to Hijri
 * @param gregorianDate - Gregorian date string
 * @returns Hijri date string or null if invalid
 */
export function gregorianToHijri(gregorianDate: string): string | null {
  if (!gregorianDate) return null;

  try {
    const m = moment(gregorianDate, "DD MMMM YYYY");
    if (m.isValid()) {
      return m.format("iDD iMMMM iYYYY");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get relative time from a date (e.g., "2 years ago")
 * @param hijriDate - Hijri date string
 * @param gregorianDate - Gregorian date string
 * @param locale - Language locale
 * @returns Relative time string
 */
export function getRelativeTime(
  hijriDate?: string,
  gregorianDate?: string,
  locale: string = "en"
): string {
  try {
    let m;
    if (gregorianDate) {
      m = moment(gregorianDate, "DD MMMM YYYY");
    } else if (hijriDate) {
      m = moment(hijriDate, "iDD iMMMM iYYYY");
    }

    if (m && m.isValid()) {
      moment.locale(locale === "ar" ? "ar" : "en");
      return m.fromNow();
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Validate if a Hijri date string is valid
 * @param hijriDate - Hijri date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidHijriDate(hijriDate: string): boolean {
  if (!hijriDate) return false;
  try {
    const m = moment(hijriDate, "iDD iMMMM iYYYY");
    return m.isValid();
  } catch {
    return false;
  }
}

/**
 * Validate if a Gregorian date string is valid
 * @param gregorianDate - Gregorian date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidGregorianDate(gregorianDate: string): boolean {
  if (!gregorianDate) return false;
  try {
    const m = moment(gregorianDate, "DD MMMM YYYY");
    return m.isValid();
  } catch {
    return false;
  }
}

/**
 * Parse a date range string (e.g., "1-5 Ramadan 1 AH")
 * @param rangeStr - Date range string
 * @returns DateRange object or null
 */
export function parseDateRange(rangeStr: string): DateRange | null {
  if (!rangeStr) return null;

  // Simple implementation - can be enhanced
  const parts = rangeStr.split("-");
  if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
    return {
      start: parts[0].trim(),
      end: parts[1].trim(),
    };
  }
  return null;
}
