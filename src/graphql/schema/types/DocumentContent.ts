import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { DocumentContent as DocumentContentType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { defaultContentComponentFields } from './ContentComponent.js';

export const DocumentContent = new GraphQLObjectType<DocumentContentType, ContextType>({
  name: 'DocumentContent',
  description: 'A document content component (e.g. PDF).',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this document content component.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the document.',
    },
    original_name: {
      type: GraphQLString,
      description: 'The original file name of the document.',
    },
    mime_type: {
      type: GraphQLString,
      description: 'The MIME type of the document file.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this document content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
