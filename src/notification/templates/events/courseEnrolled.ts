import { escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

const courseEnrolled: NotificationTemplate<'course_enrolled'> = {
  en: ({ studentName, courseTitle }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(courseTitle);

    return {
      subject: `${studentName} enrolled in ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">${name} just enrolled in your course <strong>${title}</strong>.</p>
        <p style="margin:0">Keep an eye on your course analytics to see how learners are progressing.</p>
      `,
      text: [
        `${studentName} just enrolled in your course "${courseTitle}".`,
        'Keep an eye on your course analytics to see how learners are progressing.',
      ].join('\n\n'),
      ctaLabel: 'View course analytics',
    };
  },
  ar: ({ studentName, courseTitle }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(courseTitle);

    return {
      subject: `انضم ${studentName} إلى دورة ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">انضم <strong>${name}</strong> إلى دورتك <strong>${title}</strong>.</p>
        <p style="margin:0">تابع إحصائيات دورتك لمعرفة تقدّم المتعلمين فيها.</p>
      `,
      text: [
        `انضم ${studentName} إلى دورتك "${courseTitle}".`,
        'تابع إحصائيات دورتك لمعرفة تقدّم المتعلمين فيها.',
      ].join('\n\n'),
      ctaLabel: 'عرض إحصائيات الدورة',
    };
  },
};

export default courseEnrolled;
