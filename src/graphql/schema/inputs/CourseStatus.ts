import { GraphQLID, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import CourseStatus from '../types/enum/CourseStatus';

const CourseStatusInput = new GraphQLInputObjectType({
  name: 'CourseStatusInput',
  description: 'Input for updating a course status.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course',
    },
    status: {
      type: new GraphQLNonNull(CourseStatus),
      description: 'The new status of the course',
    },
  },
});

export default CourseStatusInput;
