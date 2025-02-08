import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const TextContentInput = new GraphQLInputObjectType({
  name: 'TextContentInput',
  fields: {
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text content.',
    },
  },
});

export default TextContentInput;
