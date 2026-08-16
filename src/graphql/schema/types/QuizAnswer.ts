import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { QuizAnswer as QuizAnswerType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';

export const QuizAnswer = new GraphQLObjectType<QuizAnswerType, ContextType>({
  name: 'QuizAnswer',
  description: 'An answer option of a quiz question.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this answer.',
    },
    denomination: {
      type: GraphQLString,
      description: 'The text of this answer option.',
    },
    image_url: {
      type: GraphQLString,
      description: 'The URL of the image of this answer option.',
    },
    is_correct: {
      type: GraphQLBoolean,
      description: 'Whether this answer is correct (only visible to teachers).',
      resolve: async (parent, _, { loaders, user }) => {
        if (!user.authenticated) {
          return null;
        }

        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        return isTeacher ? parent.is_correct : null;
      },
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The rank of this answer within the question.',
    },
  },
});
