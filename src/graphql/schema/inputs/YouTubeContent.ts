import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const YouTubeContentInput = new GraphQLInputObjectType({
  name: 'YouTubeContentInput',
  fields: {
    videoId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The video ID of the YouTube video.',
    },
    description: {
      type: GraphQLString,
      description: 'The description of the YouTube.',
    },
  },
});

export default YouTubeContentInput;
