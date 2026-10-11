import { escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

/**
 * Informational only: there is no follower-management page to link to, so the
 * registry gives this type a `null` link.
 */
const newFollower: NotificationTemplate<'new_follower'> = {
  en: ({ studentName }) => {
    const name = escapeHtml(studentName);

    return {
      subject: `${studentName} is now following you`,
      bodyHtml: `
        <p style="margin:0 0 16px">${name} just started following you.</p>
        <p style="margin:0">Anything new you publish will now show up in their home feed.</p>
      `,
      text: [
        `${studentName} just started following you.`,
        'Anything new you publish will now show up in their home feed.',
      ].join('\n\n'),
    };
  },
  ar: ({ studentName }) => {
    const name = escapeHtml(studentName);

    return {
      subject: `قام ${studentName} بمتابعتك`,
      bodyHtml: `
        <p style="margin:0 0 16px">بدأ <strong>${name}</strong> بمتابعتك.</p>
        <p style="margin:0">سيظهر كل ما تنشره من جديد الآن في صفحته الرئيسية.</p>
      `,
      text: [
        `بدأ ${studentName} بمتابعتك.`,
        'سيظهر كل ما تنشره من جديد الآن في صفحته الرئيسية.',
      ].join('\n\n'),
    };
  },
};

export default newFollower;
