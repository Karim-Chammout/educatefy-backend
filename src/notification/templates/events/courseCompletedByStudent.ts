import { escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

const courseCompletedByStudent: NotificationTemplate<'course_completed_by_student'> = {
  en: ({ studentName, courseTitle }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(courseTitle);

    return {
      subject: `${studentName} completed ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">${name} completed your course <strong>${title}</strong>.</p>
        <p style="margin:0">A completed learner is a good sign — check your analytics for the full picture.</p>
      `,
      text: [
        `${studentName} completed your course "${courseTitle}".`,
        'A completed learner is a good sign — check your analytics for the full picture.',
      ].join('\n\n'),
      ctaLabel: 'View course analytics',
    };
  },
  ar: ({ studentName, courseTitle }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(courseTitle);

    return {
      subject: `أكمل ${studentName} دورة ${courseTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">أكمل <strong>${name}</strong> دورتك <strong>${title}</strong>.</p>
        <p style="margin:0">إتمام المتعلّم للدورة مؤشر جيد — راجع إحصائياتك للتفاصيل.</p>
      `,
      text: [
        `أكمل ${studentName} دورتك "${courseTitle}".`,
        'إتمام المتعلّم للدورة مؤشر جيد — راجع إحصائياتك للتفاصيل.',
      ].join('\n\n'),
      ctaLabel: 'عرض إحصائيات الدورة',
    };
  },
};

export default courseCompletedByStudent;
