import { LinkBuilder, NotificationData, NotificationTemplate, NotificationType } from './types.js';
import courseCompleted from './templates/events/courseCompleted.js';
import courseCompletedByStudent from './templates/events/courseCompletedByStudent.js';
import courseEnrolled from './templates/events/courseEnrolled.js';
import courseRated from './templates/events/courseRated.js';
import newFollower from './templates/events/newFollower.js';
import programEnrolled from './templates/events/programEnrolled.js';
import programVersionPublished from './templates/events/programVersionPublished.js';
import welcome from './templates/events/welcome.js';

export type NotificationRegistryEntry<T extends NotificationType = NotificationType> = {
  buildLink: LinkBuilder<T>;
  render: NotificationTemplate<T>;
  emailOnly?: boolean;
};

export const NOTIFICATION_REGISTRY: {
  [Key in NotificationType]: NotificationRegistryEntry<Key>;
} = {
  welcome: {
    buildLink: () => '/catalog',
    render: welcome,
    emailOnly: true,
  },
  course_enrolled: {
    buildLink: (data) => `/dashboard/analytics/courses/${data.courseId}`,
    render: courseEnrolled,
  },
  program_enrolled: {
    buildLink: () => '/dashboard/programs',
    render: programEnrolled,
  },
  course_rated: {
    buildLink: (data) => `/dashboard/analytics/courses/${data.courseId}`,
    render: courseRated,
  },
  new_follower: {
    buildLink: () => null,
    render: newFollower,
  },
  course_completed: {
    buildLink: (data) => `/course/${encodeURIComponent(data.courseSlug)}`,
    render: courseCompleted,
  },
  course_completed_by_student: {
    buildLink: (data) => `/dashboard/analytics/courses/${data.courseId}`,
    render: courseCompletedByStudent,
  },
  program_version_published: {
    buildLink: (data) => `/program/${encodeURIComponent(data.programSlug)}`,
    render: programVersionPublished,
  },
};

export function buildNotificationLink<T extends NotificationType>(
  type: T,
  data: NotificationData<T>,
): string | null {
  return NOTIFICATION_REGISTRY[type].buildLink(data);
}

export function isEmailOnly(type: NotificationType): boolean {
  return NOTIFICATION_REGISTRY[type].emailOnly === true;
}
