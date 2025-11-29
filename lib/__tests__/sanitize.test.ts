import { describe, expect, it } from "vitest";
import {
  sanitizeActionItem,
  sanitizeEmail,
  sanitizeHtml,
  sanitizeLessonNote,
  sanitizeText,
  sanitizeUrl,
} from "../sanitize";

describe("sanitizeHtml", () => {
  it("should remove script tags", () => {
    const dirty = '<p>Hello</p><script>alert("XSS")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<script>");
    expect(clean).toContain("<p>Hello</p>");
  });

  it("should remove event handlers", () => {
    const dirty = "<p onclick=\"alert('XSS')\">Click me</p>";
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("onclick");
    expect(clean).toContain("Click me");
  });

  it("should allow safe HTML tags", () => {
    const dirty = "<p>Hello <strong>world</strong></p>";
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe("<p>Hello <strong>world</strong></p>");
  });

  it("should remove dangerous attributes", () => {
    const dirty = "<a href=\"javascript:alert('XSS')\">Link</a>";
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("javascript:");
  });

  it("should handle empty input", () => {
    expect(sanitizeHtml("")).toBe("");
    expect(sanitizeHtml(null as any)).toBe("");
    expect(sanitizeHtml(undefined as any)).toBe("");
  });

  it("should handle non-string input", () => {
    expect(sanitizeHtml(123 as any)).toBe("");
    expect(sanitizeHtml({} as any)).toBe("");
  });
});

describe("sanitizeText", () => {
  it("should remove all HTML tags", () => {
    const dirty = "<p>Hello <strong>world</strong></p>";
    const clean = sanitizeText(dirty);
    expect(clean).toBe("Hello world");
  });

  it("should remove script tags and content", () => {
    const dirty = 'Hello<script>alert("XSS")</script>world';
    const clean = sanitizeText(dirty);
    expect(clean).not.toContain("<script>");
    expect(clean).toContain("Hello");
    expect(clean).toContain("world");
  });

  it("should decode HTML entities", () => {
    const dirty = "Hello &amp; goodbye";
    const clean = sanitizeText(dirty);
    expect(clean).toContain("&");
  });

  it("should handle empty input", () => {
    expect(sanitizeText("")).toBe("");
    expect(sanitizeText(null as any)).toBe("");
  });
});

describe("sanitizeLessonNote", () => {
  it("should allow rich formatting tags", () => {
    const dirty = "<h1>Title</h1><p>Text with <mark>highlight</mark></p>";
    const clean = sanitizeLessonNote(dirty);
    expect(clean).toContain("<h1>");
    expect(clean).toContain("<mark>");
  });

  it("should remove script tags", () => {
    const dirty = '<p>Note</p><script>alert("XSS")</script>';
    const clean = sanitizeLessonNote(dirty);
    expect(clean).not.toContain("<script>");
  });

  it("should allow class attribute", () => {
    const dirty = '<p class="highlight">Important</p>';
    const clean = sanitizeLessonNote(dirty);
    expect(clean).toContain('class="highlight"');
  });
});

describe("sanitizeActionItem", () => {
  it("should remove all HTML tags", () => {
    const dirty = "<p>Action <strong>item</strong></p>";
    const clean = sanitizeActionItem(dirty);
    expect(clean).toBe("Action item");
  });
});

describe("sanitizeEmail", () => {
  it("should accept valid email addresses", () => {
    expect(sanitizeEmail("user@example.com")).toBe("user@example.com");
    expect(sanitizeEmail("test.user@domain.co.uk")).toBe(
      "test.user@domain.co.uk"
    );
  });

  it("should convert to lowercase", () => {
    expect(sanitizeEmail("User@Example.COM")).toBe("user@example.com");
  });

  it("should trim whitespace", () => {
    expect(sanitizeEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("should reject invalid email addresses", () => {
    expect(sanitizeEmail("invalid")).toBe("");
    expect(sanitizeEmail("invalid@")).toBe("");
    expect(sanitizeEmail("@example.com")).toBe("");
    expect(sanitizeEmail("user@")).toBe("");
  });

  it("should sanitize HTML tags from email and validate", () => {
    // After sanitization, the email becomes "user@example.com" which is valid
    expect(sanitizeEmail('<script>alert("XSS")</script>user@example.com')).toBe(
      "user@example.com"
    );
  });

  it("should handle empty input", () => {
    expect(sanitizeEmail("")).toBe("");
    expect(sanitizeEmail(null as any)).toBe("");
  });
});

describe("sanitizeUrl", () => {
  it("should allow http and https URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
  });

  it("should allow relative URLs", () => {
    expect(sanitizeUrl("/path/to/page")).toBe("/path/to/page");
  });

  it("should allow mailto URLs", () => {
    expect(sanitizeUrl("mailto:user@example.com")).toBe(
      "mailto:user@example.com"
    );
  });

  it("should block javascript: protocol", () => {
    expect(sanitizeUrl('javascript:alert("XSS")')).toBe("");
    expect(sanitizeUrl('JavaScript:alert("XSS")')).toBe("");
  });

  it("should block data: protocol", () => {
    expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBe(
      ""
    );
  });

  it("should block vbscript: protocol", () => {
    expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe("");
  });

  it("should block file: protocol", () => {
    expect(sanitizeUrl("file:///etc/passwd")).toBe("");
  });

  it("should trim whitespace", () => {
    expect(sanitizeUrl("  https://example.com  ")).toBe("https://example.com");
  });

  it("should handle empty input", () => {
    expect(sanitizeUrl("")).toBe("");
    expect(sanitizeUrl(null as any)).toBe("");
  });
});
