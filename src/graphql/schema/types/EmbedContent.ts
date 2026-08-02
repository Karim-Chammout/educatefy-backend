import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { EmbedContent as EmbedContentType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { defaultContentComponentFields } from './ContentComponent.js';

export const EmbedContent = new GraphQLObjectType<EmbedContentType, ContextType>({
  name: 'EmbedContent',
  description: 'An embedded content component (e.g. Loom, Vimeo, Slides, CodePen).',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this embed content component.',
    },
    provider: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The provider of the embedded content.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the embedded content.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this embed content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
