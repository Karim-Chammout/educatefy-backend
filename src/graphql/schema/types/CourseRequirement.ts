import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { CourseRequirement as CourseRequirementType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';

export const CourseRequirement = new GraphQLObjectType<CourseRequirementType, ContextType>({
  name: 'CourseRequirement',
  description: 'The course requirement info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this course requirement.',
    },
    requirement: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The requirement of this course.',
    },
  },
});
