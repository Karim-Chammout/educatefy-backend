import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

const ProfilePictureDetailsInput = new GraphQLInputObjectType({
  name: 'ProfilePictureDetailsInput',
  description: 'Input for updating an account information',
  fields: {
    uuid: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The uuid of the file.',
    },
    filePath: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The file path in the bucket.',
    },
    originalFileName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The original file name.',
    },
    mimeType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The mime type of the file.',
    },
    fileSize: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The file size in bytes of this file.',
    },
  },
});

export default ProfilePictureDetailsInput;
