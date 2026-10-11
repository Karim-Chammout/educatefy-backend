import { SupportedLocale } from './templates/locale.js';

/**
 * Notification types and each one's payload shape. Adding a type = this array,
 * a `notification_type` row, and a template in `templates/events/`.
 */
export const NOTIFICATION_TYPES = [
  'welcome',
  'course_enrolled',
  'program_enrolled',
  'course_rated',
  'new_follower',
  'course_completed',
  'course_completed_by_student',
  'program_version_published',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Groups types for the preferences UI. Stored on `notification_type.category`. */
export const NOTIFICATION_CATEGORIES = ['account', 'learning', 'teaching', 'social'] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

/**
 * Raw event data per type — ids and names, never rendered text. The client
 * localizes the row, the worker renders the email, both from this object.
 */
export type NotificationDataMap = {
  welcome: {
    firstName: string | null;
  };
  /** To the course teacher, when a student self-enrolls. */
  course_enrolled: {
    studentName: string;
    courseTitle: string;
    courseId: number;
  };
  /** To the program teacher, when a student enrolls in a program. */
  program_enrolled: {
    studentName: string;
    programTitle: string;
  };
  /** To the course teacher, on a first-time review. Edits do not re-notify. */
  course_rated: {
    studentName: string;
    courseTitle: string;
    courseId: number;
    rating: number;
    review: string | null;
  };
  /** To the teacher, on a false -> true follow. Unfollows are ignored. */
  new_follower: {
    studentName: string;
  };
  /** To the student, on auto-completion. */
  course_completed: {
    courseTitle: string;
    courseSlug: string;
  };
  /** To the course teacher, on a student's auto-completion. */
  course_completed_by_student: {
    studentName: string;
    courseTitle: string;
    courseId: number;
  };
  /** To every actively enrolled student, when a new program version is published. */
  program_version_published: {
    programTitle: string;
    programSlug: string;
    versionNumber: number;
  };
};

export type NotificationData<T extends NotificationType = NotificationType> =
  NotificationDataMap[T];

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && (NOTIFICATION_TYPES as ReadonlyArray<string>).includes(value);
}

export type EmailContent = {
  subject: string;
  bodyHtml: string;
  text: string;
  ctaLabel?: string;
};

export type NotificationTemplate<T extends NotificationType = NotificationType> = {
  [Locale in SupportedLocale]: (data: NotificationData<T>) => EmailContent;
};

export type LinkBuilder<T extends NotificationType> = (data: NotificationData<T>) => string | null;
