import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Lesson as LessonType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';

export const Lesson = new GraphQLObjectType<LessonType, ContextType>({
  name: 'Lesson',
  description: 'The lesson info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this lesson.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this lesson.',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of this lesson.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this lesson is published or not',
    },
  },
});
