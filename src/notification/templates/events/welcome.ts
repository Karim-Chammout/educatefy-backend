import { BRAND_NAME, escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

const welcome: NotificationTemplate<'welcome'> = {
  en: ({ firstName }) => {
    const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,';

    return {
      subject: `Welcome to ${BRAND_NAME}`,
      bodyHtml: `
        <p style="margin:0 0 16px">${greeting}</p>
        <p style="margin:0 0 16px">Welcome to ${BRAND_NAME} — a place to learn from teachers who actually teach.</p>
        <p style="margin:0">Browse courses and programs, follow the teachers you like, and everything they publish lands on your home feed.</p>
      `,
      text: [
        firstName ? `Hi ${firstName},` : 'Hi,',
        `Welcome to ${BRAND_NAME} — a place to learn from teachers who actually teach.`,
        'Browse courses and programs, follow the teachers you like, and everything they publish lands on your home feed.',
      ].join('\n\n'),
      ctaLabel: 'Browse the catalog',
    };
  },
  ar: ({ firstName }) => {
    const greeting = firstName ? `مرحبًا ${escapeHtml(firstName)}،` : 'مرحبًا،';

    return {
      subject: `أهلاً بك في ${BRAND_NAME}`,
      bodyHtml: `
        <p style="margin:0 0 16px">${greeting}</p>
        <p style="margin:0 0 16px">أهلاً بك في ${BRAND_NAME} — منصتك للتعلم من معلمين يُتقنون ما يدرّسونه.</p>
        <p style="margin:0">تصفّح الدورات والبرامج، وتابع المعلمين الذين تعجبك مشاركاتهم، وسيظهر كل ما ينشرونه في صفحتك الرئيسية.</p>
      `,
      text: [
        firstName ? `مرحبًا ${firstName}،` : 'مرحبًا،',
        `أهلاً بك في ${BRAND_NAME} — منصتك للتعلم من معلمين يُتقنون ما يدرّسونه.`,
        'تصفّح الدورات والبرامج، وتابع المعلمين الذين تعجبك مشاركاتهم، وسيظهر كل ما ينشرونه في صفحتك الرئيسية.',
      ].join('\n\n'),
      ctaLabel: 'تصفّح الكتالوج',
    };
  },
};

export default welcome;
