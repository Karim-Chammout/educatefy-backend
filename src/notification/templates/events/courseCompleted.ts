import { escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

const courseCompleted: NotificationTemplate<'course_completed'> = {
  en: ({ courseTitle }) => {
    const title = escapeHtml(courseTitle);

    return {
      subject: `You completed ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">Nice work — you completed <strong>${title}</strong>.</p>
        <p style="margin:0">Take a look back at what you covered, or keep going with something new.</p>
      `,
      text: [
        `Nice work — you completed "${courseTitle}".`,
        'Take a look back at what you covered, or keep going with something new.',
      ].join('\n\n'),
      ctaLabel: 'Review the course',
    };
  },
  ar: ({ courseTitle }) => {
    const title = escapeHtml(courseTitle);

    return {
      subject: `أكملت دورة ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">أحسنت — لقد أكملت <strong>${title}</strong>.</p>
        <p style="margin:0">راجع ما تعلّمته، أو تابع التعلّم بمحتوى جديد.</p>
      `,
      text: [
        `أحسنت — لقد أكمت "${courseTitle}".`,
        'راجع ما تعلّمته، أو تابع التعلّم بمحتوى جديد.',
      ].join('\n\n'),
      ctaLabel: 'مراجعة الدورة',
    };
  },
};

export default courseCompleted;
