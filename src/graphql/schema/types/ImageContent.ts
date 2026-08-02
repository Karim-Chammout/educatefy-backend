import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ImageContent as ImageContentType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { defaultContentComponentFields } from './ContentComponent.js';

export const ImageContent = new GraphQLObjectType<ImageContentType, ContextType>({
  name: 'ImageContent',
  description: 'An image content component.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this image content component.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the image file.',
    },
    original_name: {
      type: GraphQLString,
      description: 'The original file name of the image.',
    },
    mime_type: {
      type: GraphQLString,
      description: 'The MIME type of the image file.',
    },
    alt_text: {
      type: GraphQLString,
      description: 'The alternative text of the image.',
    },
    caption: {
      type: GraphQLString,
      description: 'The caption of the image.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this image content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
