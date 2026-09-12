import { Locale, LanguageConfig, TranslationSchema } from "./types";
import { en } from "./en";
import { ar } from "./ar";
import { de } from "./de";
import { ja } from "./ja";
import { es } from "./es";

export * from "./types";

export const SUPPORTED_LOCALES: Locale[] = ["ar", "en", "de", "ja", "es"];
export const DEFAULT_LOCALE: Locale = "en";

export const LANGUAGES: Record<Locale, LanguageConfig> = {
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇪🇬",
    country: "Egypt / مصر",
    dir: "rtl",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    country: "United States",
    dir: "ltr",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    country: "Germany / Deutschland",
    dir: "ltr",
  },
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    country: "Japan / 日本",
    dir: "ltr",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    country: "Spain / España",
    dir: "ltr",
  },
};

export const LANGUAGE_LIST: LanguageConfig[] = Object.values(LANGUAGES);

export const DICTIONARIES: Record<Locale, TranslationSchema> = {
  en,
  ar,
  de,
  ja,
  es,
};

export function getDictionary(locale: Locale): TranslationSchema {
  return DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
}

export function getLanguageConfig(locale: Locale): LanguageConfig {
  return LANGUAGES[locale] || LANGUAGES[DEFAULT_LOCALE];
}
