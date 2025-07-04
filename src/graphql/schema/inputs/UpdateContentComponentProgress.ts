import { GraphQLBoolean, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

export const UpdateContentComponentProgressInput = new GraphQLInputObjectType({
  name: 'UpdateContentComponentProgressInput',
  description: 'Input for updating content component progress',
  fields: () => ({
    contentComponentId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The content component ID',
    },
    isCompleted: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Flag to indicate if the content component is completed',
    },
  }),
});
