import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { Teacher } from './Teacher.js';
import { ContentItem } from './union/ContentItem.js';

export const TeacherContent = new GraphQLObjectType({
  name: 'TeacherContent',
  description:
    'A followed teacher together with a bounded page of their qualifying published content.',
  fields: {
    teacher: {
      type: new GraphQLNonNull(Teacher),
      description: 'The teacher these items belong to.',
    },
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ContentItem))),
      description: 'The teacher items for the requested page.',
    },
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of qualifying items this teacher has for the account.',
    },
  },
});
