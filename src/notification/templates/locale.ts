export const SUPPORTED_LOCALES = ['en', 'ar'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(value);
}

/**
 * `en_GB` -> `en`, `PT-br` -> `pt` (unsupported, so English), `ar` -> `ar`.
 */
export function resolveLocale(languageCode: string | null | undefined): SupportedLocale {
  if (!languageCode) {
    return DEFAULT_LOCALE;
  }

  const primary = languageCode.trim().toLowerCase().split(/[_-]/)[0];

  return isSupportedLocale(primary) ? primary : DEFAULT_LOCALE;
}
