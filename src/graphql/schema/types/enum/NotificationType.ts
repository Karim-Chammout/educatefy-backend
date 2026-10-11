import { GraphQLEnumType } from 'graphql';

const NotificationTypeEnum = new GraphQLEnumType({
  name: 'NotificationType',
  description: 'The kind of event a notification was generated from.',
  values: {
    welcome: {
      value: 'welcome',
      description: 'Sent once when a new account is created (email only, not configurable).',
    },
    course_enrolled: {
      value: 'course_enrolled',
      description: 'Sent to the teacher when a student enrolls in their course.',
    },
    program_enrolled: {
      value: 'program_enrolled',
      description: 'Sent to the teacher when a student enrolls in their program.',
    },
    course_rated: {
      value: 'course_rated',
      description: 'Sent to the teacher when a student rates their course.',
    },
    new_follower: {
      value: 'new_follower',
      description: 'Sent to the teacher when another account starts following them.',
    },
    course_completed: {
      value: 'course_completed',
      description: 'Sent to the student when they finish all required content of a course.',
    },
    course_completed_by_student: {
      value: 'course_completed_by_student',
      description: 'Sent to the teacher when a student completes their course.',
    },
    program_version_published: {
      value: 'program_version_published',
      description: 'Sent to enrolled students when the teacher publishes a new program version.',
    },
  },
});

export default NotificationTypeEnum;
