import { GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';

import { defaultContentComponentFields } from './ContentComponent.js';

export const TextContent = new GraphQLObjectType({
  name: 'TextContent',
  description: 'A text content component.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this text content component.',
    },
    content: {
      type: new GraphQLNonNull(GraphQLJSON),
      description: 'The text content.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this text content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
