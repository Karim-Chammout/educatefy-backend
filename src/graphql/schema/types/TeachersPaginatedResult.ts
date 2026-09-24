import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { Teacher } from './Teacher.js';

export const TeachersPaginatedResult = new GraphQLObjectType({
  name: 'TeachersPaginatedResult',
  description: 'A page of teachers together with the total number of available teachers.',
  fields: {
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Teacher))),
      description: 'The teachers for the requested page.',
    },
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of available teachers across all pages.',
    },
  },
});
