import { escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

const programEnrolled: NotificationTemplate<'program_enrolled'> = {
  en: ({ studentName, programTitle }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(programTitle);

    return {
      subject: `${studentName} enrolled in ${programTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">${name} just enrolled in your program <strong>${title}</strong>.</p>
        <p style="margin:0">You can manage your program's courses and versions from your dashboard.</p>
      `,
      text: [
        `${studentName} just enrolled in your program "${programTitle}".`,
        "You can manage your program's courses and versions from your dashboard.",
      ].join('\n\n'),
      ctaLabel: 'Manage your programs',
    };
  },
  ar: ({ studentName, programTitle }) => {
    const name = escapeHtml(studentName);
    const title = escapeHtml(programTitle);

    return {
      subject: `انضم ${studentName} إلى برنامج ${programTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">انضم <strong>${name}</strong> إلى برنامجك <strong>${title}</strong>.</p>
        <p style="margin:0">يمكنك إدارة دورات البرنامج وإصداراته من لوحة التحكم.</p>
      `,
      text: [
        `انضم ${studentName} إلى برنامجك "${programTitle}".`,
        'يمكنك إدارة دورات البرنامج وإصداراته من لوحة التحكم.',
      ].join('\n\n'),
      ctaLabel: 'إدارة برامجك',
    };
  },
};

export default programEnrolled;
