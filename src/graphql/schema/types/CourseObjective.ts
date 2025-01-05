import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { CourseObjective as CourseObjectiveType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';

export const CourseObjective = new GraphQLObjectType<CourseObjectiveType, ContextType>({
  name: 'CourseObjective',
  description: 'The course objective info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this course objective.',
    },
    objective: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The objective of this course.',
    },
  },
});
