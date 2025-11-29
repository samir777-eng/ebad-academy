import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://ebad-academy.vercel.app"
  ),
  title: {
    default: "Ebad Academy - أكاديمية عباد | Comprehensive Islamic Education",
    template: "%s | Ebad Academy",
  },
  description:
    "Transform from beginner to knowledgeable Muslim with Ebad Academy's comprehensive Islamic education platform. Learn Quran, Hadith, Fiqh, and more. منهج جامعي متكامل لتعليم الإسلام من الصفر",
  keywords: [
    "Islamic education",
    "Quran learning",
    "Hadith studies",
    "Fiqh",
    "Islamic academy",
    "Muslim education",
    "تعليم إسلامي",
    "أكاديمية عباد",
    "تعلم القرآن",
    "الحديث",
    "الفقه",
  ],
  authors: [{ name: "Ebad Academy" }],
  creator: "Ebad Academy",
  publisher: "Ebad Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
    url: "/",
    siteName: "Ebad Academy",
    title: "Ebad Academy - Comprehensive Islamic Education Platform",
    description:
      "Transform from beginner to knowledgeable Muslim with our comprehensive Islamic education platform. Learn Quran, Hadith, Fiqh, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ebad Academy - Islamic Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ebad Academy - Comprehensive Islamic Education",
    description:
      "Transform from beginner to knowledgeable Muslim. Learn Quran, Hadith, Fiqh, and more.",
    images: ["/twitter-image.png"],
    creator: "@ebadacademy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  verification: {
    // Add your verification codes when you set up these services
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ar: "/ar",
    },
  },
  category: "education",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  // Don't set lang/dir here - let the [locale] layout handle it
  // This is the root layout that wraps all routes
  return (
    <html suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
