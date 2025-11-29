import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://ebad-academy.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ar/", "/en/"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/profile/",
          "/_next/",
          "/ar/admin/",
          "/en/admin/",
          "/ar/dashboard/",
          "/en/dashboard/",
          "/ar/profile/",
          "/en/profile/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

