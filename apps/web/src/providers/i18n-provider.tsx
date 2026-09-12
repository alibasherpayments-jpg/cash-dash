"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Locale,
  LanguageConfig,
  TranslationSchema,
  LANGUAGES,
  LANGUAGE_LIST,
  DICTIONARIES,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "@/locales";

interface I18nContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  config: LanguageConfig;
  t: TranslationSchema;
  setLocale: (locale: Locale) => void;
  languages: LanguageConfig[];
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  dir: "ltr",
  config: LANGUAGES[DEFAULT_LOCALE],
  t: DICTIONARIES[DEFAULT_LOCALE],
  setLocale: () => {},
  languages: LANGUAGE_LIST,
});

const STORAGE_KEY = "cashdash_locale";
const COOKIE_KEY = "NEXT_LOCALE";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage or navigator
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && SUPPORTED_LOCALES.includes(saved)) {
        setLocaleState(saved);
      } else {
        // Check browser language
        const browserLang = navigator.language?.split("-")[0] as Locale;
        if (browserLang && SUPPORTED_LOCALES.includes(browserLang)) {
          setLocaleState(browserLang);
        }
      }
    } catch {
      // localStorage may fail in some environments
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${COOKIE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore storage errors
    }
  };

  // Sync document attributes (lang and dir)
  useEffect(() => {
    const config = LANGUAGES[locale] || LANGUAGES[DEFAULT_LOCALE];
    document.documentElement.lang = locale;
    document.documentElement.dir = config.dir;
    
    // Add/remove font or rtl helper classes if needed
    if (config.dir === "rtl") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [locale]);

  const config = LANGUAGES[locale] || LANGUAGES[DEFAULT_LOCALE];
  const t = DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];

  return (
    <I18nContext.Provider
      value={{
        locale,
        dir: config.dir,
        config,
        t,
        setLocale,
        languages: LANGUAGE_LIST,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
