import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const LessonInfoInput = new GraphQLInputObjectType({
  name: 'LessonInfoInput',
  description: 'Input for createing a lesson record.',
  fields: {
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this lesson.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this lesson is published or not.',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of the lesson in minutes.',
    },
  },
});

export default LessonInfoInput;
