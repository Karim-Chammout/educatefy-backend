import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ContentItem } from './union/ContentItem.js';

export const ContentPaginatedResult = new GraphQLObjectType({
  name: 'ContentPaginatedResult',
  description: 'A page of content items together with the total number of available items.',
  fields: {
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ContentItem))),
      description: 'The content items for the requested page.',
    },
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of available content items across all pages.',
    },
  },
});
