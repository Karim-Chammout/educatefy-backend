import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';

const UpdateCourseSectionItemRankInput = new GraphQLInputObjectType({
  name: 'UpdateCourseSectionItemRankInput',
  description: 'Input for updating a course section item rank',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the course section item',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The new rank of the course section item',
    },
  },
});

export default UpdateCourseSectionItemRankInput;
