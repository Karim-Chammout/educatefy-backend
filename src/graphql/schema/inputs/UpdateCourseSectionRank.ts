import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';

const UpdateCourseSectionRankInput = new GraphQLInputObjectType({
  name: 'UpdateCourseSectionRankInput',
  description: 'Input for updating a course section rank',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the course section',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The new rank of the course section',
    },
  },
});

export default UpdateCourseSectionRankInput;
