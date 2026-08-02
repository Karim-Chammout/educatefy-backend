import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const DocumentContentInput = new GraphQLInputObjectType({
  name: 'DocumentContentInput',
  fields: {
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the document.',
    },
    originalName: {
      type: GraphQLString,
      description: 'The original file name of the document.',
    },
    mimeType: {
      type: GraphQLString,
      description: 'The MIME type of the document file.',
    },
  },
});

export default DocumentContentInput;
