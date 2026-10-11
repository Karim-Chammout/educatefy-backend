import { escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

const courseRated: NotificationTemplate<'course_rated'> = {
  en: ({ studentName, courseTitle, rating, review }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(courseTitle);
    const quote = review
      ? `<blockquote style="margin:20px 0 0;padding:12px 16px;border-left:3px solid #e5e7eb;color:#374151;font-style:italic">${escapeHtml(
          review,
        )}</blockquote>`
      : '';

    return {
      subject: `${studentName} reviewed ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">${name} left a ${rating}-star review on <strong>${title}</strong>.</p>
        ${quote}
      `,
      text: [
        `${studentName} left a ${rating}-star review on "${courseTitle}".`,
        ...(review ? [`“${review}”`] : []),
      ].join('\n\n'),
      ctaLabel: 'View course analytics',
    };
  },
  ar: ({ studentName, courseTitle, rating, review }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(courseTitle);
    const quote = review
      ? `<blockquote style="margin:20px 0 0;padding:12px 16px;border-right:3px solid #e5e7eb;color:#374151;font-style:italic">${escapeHtml(
          review,
        )}</blockquote>`
      : '';

    return {
      subject: `كتب ${studentName} مراجعة لدورة ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">كتب <strong>${name}</strong> مراجعة بتقييم ${rating} نجوم على الدورة <strong>${title}</strong>.</p>
        ${quote}
      `,
      text: [
        `كتب ${studentName} مراجعة بتقييم ${rating} نجوم على الدورة "${courseTitle}".`,
        ...(review ? [`«${review}»`] : []),
      ].join('\n\n'),
      ctaLabel: 'عرض إحصائيات الدورة',
    };
  },
};

export default courseRated;
