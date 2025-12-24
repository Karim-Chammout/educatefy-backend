import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ContextType } from '../../../types/types';

export const Statistics = new GraphQLObjectType<any, ContextType>({
  name: 'Statistics',
  description: 'Statistics info for the current user.',
  fields: {
    enrolledCoursesCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of enrolled courses by the user',
    },
    completedCoursesCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of completed courses by the user',
    },
  },
});
