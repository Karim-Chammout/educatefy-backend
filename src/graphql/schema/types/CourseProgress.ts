import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import { ContextType } from '../../../types/types.js';

export const CourseProgress = new GraphQLObjectType<any, ContextType>({
  name: 'CourseProgress',
  description: 'The progress of the current user through a course.',
  fields: () => ({
    completedComponents: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The number of completed content components plus passed quizzes (a quiz counts as one unit).',
    },
    totalComponents: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The total number of published content components plus published quizzes (a quiz counts as one unit).',
    },
    progressPercentage: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The course progress as a percentage from 0 to 100.',
    },
    isCompleted: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        'True when every unit is completed, i.e. the course completion gate would pass (0 when the course has no content).',
    },
  }),
});
