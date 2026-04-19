import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { YoutubeContent as YouTubeContentType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { defaultContentComponentFields } from './ContentComponent';

export const YouTubeContent = new GraphQLObjectType<YouTubeContentType, ContextType>({
  name: 'YouTubeContent',
  description: 'A YouTube content component.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this video content component.',
    },
    youtube_video_id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The YouTube video id.',
    },
    description: {
      type: GraphQLJSON,
      description: 'The description of the YouTube.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this video content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
