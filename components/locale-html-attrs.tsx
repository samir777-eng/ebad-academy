"use client";

import { useEffect } from "react";

interface LocaleHtmlAttrsProps {
  locale: string;
}

export function LocaleHtmlAttrs({ locale }: LocaleHtmlAttrsProps) {
  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", dir);
  }, [locale]);

  return null;
}

