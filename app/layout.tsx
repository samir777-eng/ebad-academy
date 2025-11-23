import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ebad Academy - أكاديمية عباد",
  description:
    "A comprehensive Islamic education platform - منهج جامعي متكامل لتعليم الإسلام",
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
