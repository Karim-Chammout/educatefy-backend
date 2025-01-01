import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types';

export const Language = new GraphQLObjectType<any, ContextType>({
  name: 'Language',
  description: 'The language info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this language',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of this language',
    },
    code: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The code of this language',
    },
  },
});
