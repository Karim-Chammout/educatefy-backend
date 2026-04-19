import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

const TextContentInput = new GraphQLInputObjectType({
  name: 'TextContentInput',
  fields: {
    content: {
      type: new GraphQLNonNull(GraphQLJSON),
      description: 'The text content.',
    },
  },
});

export default TextContentInput;
