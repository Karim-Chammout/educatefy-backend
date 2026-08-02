import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const AudioContentInput = new GraphQLInputObjectType({
  name: 'AudioContentInput',
  fields: {
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the audio file.',
    },
    originalName: {
      type: GraphQLString,
      description: 'The original file name of the audio.',
    },
    mimeType: {
      type: GraphQLString,
      description: 'The MIME type of the audio file.',
    },
  },
});

export default AudioContentInput;
