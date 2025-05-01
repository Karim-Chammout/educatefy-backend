import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const RateCourse = new GraphQLInputObjectType({
  name: 'RateCourse',
  description: 'Input for rating a course.',
  fields: {
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course.',
    },
    rating: {
      type: GraphQLFloat,
      description: 'star rating value between 1 and 5',
    },
    review: {
      type: GraphQLString,
      description: 'The review text given by the reviewer',
    },
  },
});

export default RateCourse;
