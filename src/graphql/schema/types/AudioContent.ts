import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { AudioContent as AudioContentType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { defaultContentComponentFields } from './ContentComponent.js';

export const AudioContent = new GraphQLObjectType<AudioContentType, ContextType>({
  name: 'AudioContent',
  description: 'An audio content component.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this audio content component.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the audio file.',
    },
    original_name: {
      type: GraphQLString,
      description: 'The original file name of the audio.',
    },
    mime_type: {
      type: GraphQLString,
      description: 'The MIME type of the audio file.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this audio content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
