import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';

const UpdateProgramCourseRankInput = new GraphQLInputObjectType({
  name: 'UpdateProgramCourseRankInput',
  description: 'Input for updating a program courses rank',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the course',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The new rank of the course',
    },
  },
});

export default UpdateProgramCourseRankInput;
