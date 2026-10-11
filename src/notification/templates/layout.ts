import { SupportedLocale } from './locale.js';

/**
 * Shared email shell: table-based, inline-styled HTML (Outlook/Gmail require
 * it). Run user-supplied values through `escapeHtml` first.
 */

export const BRAND_NAME = 'Educatefy';
const ACCENT = '#3B82F6';
const TEXT = '#111827';
const MUTED = '#6b7280';
const SURFACE = '#f9fafb';

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * `notification.link` is relative (the React router needs it that way);
 * email links cannot be, so it is resolved against `APP_URL` here.
 */
export function absoluteUrl(link: string | null | undefined, appUrl: string): string | null {
  if (!link) {
    return null;
  }

  try {
    return new URL(link, appUrl).toString();
  } catch (_e) {
    return null;
  }
}

export type EmailLayoutOptions = {
  locale: SupportedLocale;
  /** Rendered once at the top, hidden — the inbox preview line. */
  preheader: string;
  bodyHtml: string;
  cta?: { url: string; label: string } | null;
  /** Absolute URL of the "manage notifications" page in the footer. */
  preferencesUrl?: string | null;
};

export function emailLayout({
  locale,
  preheader,
  bodyHtml,
  cta,
  preferencesUrl,
}: EmailLayoutOptions): string {
  const isRtl = locale === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const align = isRtl ? 'right' : 'left';

  const preheaderHtml = `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(
    preheader,
  )}</div>`;

  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0">
         <tr><td align="${align}">
           <a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;padding:13px 28px;border-radius:6px;text-decoration:none">${escapeHtml(
             cta.label,
           )}</a>
         </td></tr>
       </table>`
    : '';

  const preferencesHtml = preferencesUrl
    ? `<p style="margin:0 0 6px"><a href="${escapeHtml(
        preferencesUrl,
      )}" style="color:${MUTED};text-decoration:underline">${isRtl ? 'إدارة إشعاراتك' : 'Manage your notifications'}</a></p>`
    : '';

  const signOff = isRtl
    ? `مع تحياتنا،<br />فريق ${BRAND_NAME}`
    : `Happy learning,<br />The ${BRAND_NAME} team`;

  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(preheader)}</title>
  </head>
  <body style="margin:0;padding:0;background:${SURFACE}">
    ${preheaderHtml}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};padding:24px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:10px;border:1px solid #e5e7eb">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif">
                <span style="font-size:20px;font-weight:bold;color:${ACCENT}">${BRAND_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:${TEXT};text-align:${align}">
                ${bodyHtml}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED};text-align:${align}">
                ${signOff}
                ${preferencesHtml}
                <p style="margin:14px 0 0;color:#9ca3af">
                  ${
                    isRtl
                      ? `تصل هذه الرسالة إلى العنوان المسجل في حسابك على ${BRAND_NAME}.`
                      : `You're receiving this because of your notification settings on ${BRAND_NAME}.`
                  }
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
