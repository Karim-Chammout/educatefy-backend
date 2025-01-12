import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { defaultContentComponentFields } from './ContentComponent';

export const TextContent = new GraphQLObjectType({
  name: 'TextContent',
  description: 'A text content component.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this text content component.',
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text content.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this text content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
