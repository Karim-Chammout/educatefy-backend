import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const CourseSectionInfoInput = new GraphQLInputObjectType({
  name: 'CourseSectionInfoInput',
  description: 'Input for createing a course section record.',
  fields: {
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this course section.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this course section is published or not.',
    },
  },
});

export default CourseSectionInfoInput;
