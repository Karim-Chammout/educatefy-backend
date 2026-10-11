import { escapeHtml } from '../layout.js';
import { NotificationTemplate } from '../../types.js';

const programVersionPublished: NotificationTemplate<'program_version_published'> = {
  en: ({ programTitle, versionNumber }) => {
    const title = escapeHtml(programTitle);

    return {
      subject: `${programTitle} has a new version`,
      bodyHtml: `
        <p style="margin:0 0 16px">Version ${versionNumber} of <strong>${title}</strong> is now available.</p>
        <p style="margin:0">Your enrollment is already up to date — have a look at what changed.</p>
      `,
      text: [
        `Version ${versionNumber} of "${programTitle}" is now available.`,
        'Your enrollment is already up to date — have a look at what changed.',
      ].join('\n\n'),
      ctaLabel: 'Open the program',
    };
  },
  ar: ({ programTitle, versionNumber }) => {
    const title = escapeHtml(programTitle);

    return {
      subject: `صدر إصدار جديد من برنامج ${programTitle}`,
      bodyHtml: `
        <p style="margin:0 0 16px">أصبح الإصدار ${versionNumber} من برنامج <strong>${title}</strong> متاحًا الآن.</p>
        <p style="margin:0">تسجيلك محدَّث بالفعل — اطّلع على ما تغيّر.</p>
      `,
      text: [
        `أصبح الإصدار ${versionNumber} من برنامج "${programTitle}" متاحًا الآن.`,
        'تسجيلك محدَّث بالفعل — اطّلع على ما تغيّر.',
      ].join('\n\n'),
      ctaLabel: 'فتح البرنامج',
    };
  },
};

export default programVersionPublished;
