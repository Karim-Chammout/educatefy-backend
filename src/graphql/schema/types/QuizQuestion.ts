import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { QuizQuestion as QuizQuestionRow } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import QuizQuestionDifficulty from './enum/QuizQuestionDifficulty.js';
import QuizQuestionMediaType from './enum/QuizQuestionMediaType.js';
import QuizQuestionType from './enum/QuizQuestionType.js';
import { QuizAnswer } from './QuizAnswer.js';

export const QuizQuestion = new GraphQLObjectType<QuizQuestionRow, ContextType>({
  name: 'QuizQuestion',
  description: 'A question of a quiz.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this question.',
    },
    prompt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text of the question.',
    },
    question_type: {
      type: new GraphQLNonNull(QuizQuestionType),
      description: 'The type of the question.',
    },
    points: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The points awarded for answering this question correctly.',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The rank of this question within the quiz.',
    },
    media_url: {
      type: GraphQLString,
      description: 'The URL of the media attached to this question.',
    },
    media_type: {
      type: QuizQuestionMediaType,
      description: 'The type of media attached to this question.',
    },
    hint: {
      type: GraphQLString,
      description: 'An optional hint shown to students on demand.',
    },
    difficulty: {
      type: QuizQuestionDifficulty,
      description: 'The difficulty level of this question.',
    },
    learning_objective: {
      type: GraphQLString,
      description: 'The learning objective this question targets.',
    },
    feedback_correct: {
      type: GraphQLString,
      description: 'The feedback shown when this question is answered correctly.',
    },
    feedback_incorrect: {
      type: GraphQLString,
      description: 'The feedback shown when this question is answered incorrectly.',
    },
    answers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuizAnswer))),
      description: 'The answer options of this question.',
      resolve: async (parent, _, { loaders }) => {
        const answers = await loaders.QuizAnswer.loadByQuestionId(parent.id);

        return [...answers].sort((a, b) => a.rank - b.rank);
      },
    },
  },
});
