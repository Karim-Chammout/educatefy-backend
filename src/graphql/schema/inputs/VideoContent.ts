import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const VideoContentInput = new GraphQLInputObjectType({
  name: 'VideoContentInput',
  fields: {
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the video.',
    },
  },
});

export default VideoContentInput;
