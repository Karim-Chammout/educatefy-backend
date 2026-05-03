import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';

const YouTubeContentInput = new GraphQLInputObjectType({
  name: 'YouTubeContentInput',
  fields: {
    videoId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The video ID of the YouTube video.',
    },
    description: {
      type: GraphQLJSON,
      description: 'The description of the YouTube.',
    },
  },
});

export default YouTubeContentInput;
