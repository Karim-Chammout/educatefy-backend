import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const UpdateCourseSectionInfo = new GraphQLInputObjectType({
  name: 'UpdateCourseSectionInfo',
  description: 'Input for updating a course section record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course section.',
    },
    denomination: {
      type: GraphQLString,
      description: 'The denomination of this course section.',
    },
    is_published: {
      type: GraphQLBoolean,
      description: 'A flag to indicate whether this course section is published or not.',
    },
  },
});

export default UpdateCourseSectionInfo;
