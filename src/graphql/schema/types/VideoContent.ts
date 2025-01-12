import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { defaultContentComponentFields } from './ContentComponent';

export const VideoContent = new GraphQLObjectType({
  name: 'VideoContent',
  description: 'A video content component.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this video content component.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the video.',
    },
    component_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the component this video content belongs to.',
    },
    ...defaultContentComponentFields,
  },
});
