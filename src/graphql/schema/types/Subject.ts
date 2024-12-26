import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types';

export const Subject = new GraphQLObjectType<any, ContextType>({
  name: 'Subject',
  description: 'The subject info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this subject.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of this subject.',
    },
  },
});
