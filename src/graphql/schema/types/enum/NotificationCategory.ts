import { GraphQLEnumType } from 'graphql';

export const NotificationCategoryEnum = {
  account: 'account',
  learning: 'learning',
  teaching: 'teaching',
  social: 'social',
} as const;

const NotificationCategory = new GraphQLEnumType({
  name: 'NotificationCategory',
  description: 'The grouping a notification type belongs to, used to lay out the preferences UI.',
  values: {
    account: {
      value: 'account',
      description: 'Account lifecycle events (e.g. welcome).',
    },
    learning: {
      value: 'learning',
      description:
        "Events about the learner's own progress and content updates (course completion, program version published).",
    },
    teaching: {
      value: 'teaching',
      description:
        "Events about activity in the teacher's own courses and programs (enrollments, ratings, student completions).",
    },
    social: {
      value: 'social',
      description: 'Events about follower and social graph activity.',
    },
  },
});

export default NotificationCategory;
