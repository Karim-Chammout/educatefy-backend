import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { ComponentType } from '../types/enum/ContentComponent';

const UpdateContentComponentBaseInput = new GraphQLInputObjectType({
  name: 'UpdateContentComponentBaseInput',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The content component ID.',
    },
    type: {
      type: new GraphQLNonNull(ComponentType),
      description: 'The type of the component.',
    },
    denomination: {
      type: GraphQLString,
      description: 'The denomination of the component.',
    },
    isRequired: {
      type: GraphQLBoolean,
      description: 'A flag indicating whether the component is required to continue.',
    },
    isPublished: {
      type: GraphQLBoolean,
      description: 'A flag indicating whether the component is published.',
    },
  },
});

export default UpdateContentComponentBaseInput;
