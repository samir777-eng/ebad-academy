import { ErrorBoundary } from "@/components/error-boundary";
import { LocaleHtmlAttrs } from "@/components/locale-html-attrs";
import { locales } from "@/i18n";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages({ locale });

  return (
    <>
      <LocaleHtmlAttrs locale={locale} />
      <NextIntlClientProvider messages={messages}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </NextIntlClientProvider>
    </>
  );
}
