import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const ImageContentInput = new GraphQLInputObjectType({
  name: 'ImageContentInput',
  fields: {
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the image file.',
    },
    originalName: {
      type: GraphQLString,
      description: 'The original file name of the image.',
    },
    mimeType: {
      type: GraphQLString,
      description: 'The MIME type of the image file.',
    },
    altText: {
      type: GraphQLString,
      description: 'The alternative text of the image.',
    },
    caption: {
      type: GraphQLString,
      description: 'The caption of the image.',
    },
  },
});

export default ImageContentInput;
