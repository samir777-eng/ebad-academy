import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "الخريطة الذهنية للسيرة النبوية",
  description: "خريطة ذهنية تفاعلية شاملة للسيرة النبوية الشريفة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} antialiased`}
        style={{ fontFamily: 'var(--font-cairo), var(--font-tajawal), Arial, sans-serif' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
