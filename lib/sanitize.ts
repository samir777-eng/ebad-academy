import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize user-generated HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string, options?: any): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  // Default configuration - allows basic formatting but removes scripts
  const defaultConfig: any = {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    ...options,
  };

  return String(DOMPurify.sanitize(dirty, defaultConfig));
}

/**
 * Sanitize plain text input (removes all HTML tags)
 * Use for user names, titles, and other plain text fields
 * @param dirty - The potentially unsafe text string
 * @returns Sanitized plain text string
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  // Remove all HTML tags and decode HTML entities
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize user input for lesson notes (allows rich formatting)
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string with rich formatting allowed
 */
export function sanitizeLessonNote(dirty: string): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
      "pre",
      "mark",
      "small",
      "sub",
      "sup",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize action item text (plain text only)
 * @param dirty - The potentially unsafe text string
 * @returns Sanitized plain text string
 */
export function sanitizeActionItem(dirty: string): string {
  return sanitizeText(dirty);
}

/**
 * Validate and sanitize email addresses
 * @param email - The email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();

  if (!emailRegex.test(trimmed)) {
    return "";
  }

  // Remove any HTML tags and dangerous characters
  return sanitizeText(trimmed);
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  const lowerUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return "";
    }
  }

  // Only allow http, https, and mailto
  if (
    !lowerUrl.startsWith("http://") &&
    !lowerUrl.startsWith("https://") &&
    !lowerUrl.startsWith("mailto:") &&
    !lowerUrl.startsWith("/")
  ) {
    return "";
  }

  return trimmed;
}
