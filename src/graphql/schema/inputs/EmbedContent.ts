import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const EmbedContentInput = new GraphQLInputObjectType({
  name: 'EmbedContentInput',
  fields: {
    provider: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The provider of the embedded content.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the embedded content.',
    },
  },
});

export default EmbedContentInput;
