import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const UpdateLessonInfoInput = new GraphQLInputObjectType({
  name: 'UpdateLessonInfoInput',
  description: 'Input for updating a lesson record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the lesson.',
    },
    denomination: {
      type: GraphQLString,
      description: 'The denomination of this lesson.',
    },
    is_published: {
      type: GraphQLBoolean,
      description: 'A flag to indicate whether this lesson is published or not.',
    },
    duration: {
      type: GraphQLInt,
      description: 'The duration of the lesson in minutes.',
    },
  },
});

export default UpdateLessonInfoInput;
