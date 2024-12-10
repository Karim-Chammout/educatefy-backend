import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types';

export const Country = new GraphQLObjectType<any, ContextType>({
  name: 'Country',
  description: 'The country info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this country',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of this country',
    },
    iso: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The iso code of this country',
    },
    iso3: {
      type: GraphQLString,
      description: 'The iso3 code of this country',
    },
    num_code: {
      type: GraphQLString,
      description: 'The num_code code of this country',
    },
    phone_code: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The phone_code code of this country',
    },
  },
});
