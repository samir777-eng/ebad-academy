import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

/**
 * Dynamic sitemap generation for Ebad Academy
 * Automatically includes all public pages and lessons
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://ebad-academy.vercel.app";

  // Static pages with improved SEO priorities
  const staticPages: MetadataRoute.Sitemap = [
    // Home pages (highest priority)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    // Authentication pages
    {
      url: `${baseUrl}/ar/auth/signin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/auth/signin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ar/auth/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/auth/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Legacy login/register routes (for backwards compatibility)
    {
      url: `${baseUrl}/ar/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/en/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ar/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/en/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    // Get all lessons from database for dynamic sitemap
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    // Generate lesson pages for both languages
    const lessonPages: MetadataRoute.Sitemap = lessons.flatMap((lesson) => [
      {
        url: `${baseUrl}/en/dashboard/lessons/${lesson.id}`,
        lastModified: new Date(), // Use current date since Lesson model doesn't have updatedAt
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/ar/dashboard/lessons/${lesson.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ]);

    return [...staticPages, ...lessonPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages only if database query fails
    return staticPages;
  }
}
