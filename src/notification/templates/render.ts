import config from '../../config.js';
import { NOTIFICATION_REGISTRY, buildNotificationLink } from '../registry.js';
import { NotificationData, NotificationType } from '../types.js';
import { SupportedLocale, resolveLocale } from './locale.js';
import { absoluteUrl, emailLayout } from './layout.js';

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
  /** The relative route, kept for auditing what the button pointed at. */
  link: string | null;
};

/**
 * Renders a notification into a finished email. Everything is resolved at send
 * time from the stored payload, so an old outbox row still renders correctly
 * after a copy change or a language switch.
 */
export function renderEmail<T extends NotificationType>(
  type: T,
  data: NotificationData<T>,
  languageCode: string | null | undefined,
): RenderedEmail {
  const locale: SupportedLocale = resolveLocale(languageCode);
  const link = buildNotificationLink(type, data);
  const content = NOTIFICATION_REGISTRY[type].render[locale](data);

  const ctaUrl = absoluteUrl(link, config.APP_URL);
  const preferencesUrl = absoluteUrl('/profile', config.APP_URL);

  const html = emailLayout({
    locale,
    preheader: content.subject,
    bodyHtml: content.bodyHtml,
    cta: ctaUrl && content.ctaLabel ? { url: ctaUrl, label: content.ctaLabel } : null,
    preferencesUrl,
  });

  return {
    subject: content.subject,
    html,
    text: content.text,
    link,
  };
}
