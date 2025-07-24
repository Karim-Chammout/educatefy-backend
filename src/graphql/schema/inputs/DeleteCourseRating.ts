import { GraphQLID, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

const DeleteCourseRatingInput = new GraphQLInputObjectType({
  name: 'DeleteCourseRatingInput',
  description: 'Input for deleting a course rating',
  fields: {
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course.',
    },
    courseRateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course rating to delete.',
    },
  },
});

export default DeleteCourseRatingInput;
