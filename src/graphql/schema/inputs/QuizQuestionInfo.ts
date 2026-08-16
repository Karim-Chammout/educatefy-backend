import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import QuizQuestionDifficulty from '../types/enum/QuizQuestionDifficulty.js';
import QuizQuestionMediaType from '../types/enum/QuizQuestionMediaType.js';
import QuizQuestionType from '../types/enum/QuizQuestionType.js';
import QuizAnswerInfoInput from './QuizAnswerInfo.js';

const QuizQuestionInfoInput = new GraphQLInputObjectType({
  name: 'QuizQuestionInfoInput',
  description: 'Input for creating a quiz question.',
  fields: {
    prompt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text of the question.',
    },
    question_type: {
      type: new GraphQLNonNull(QuizQuestionType),
      description: 'The type of the question.',
    },
    points: {
      type: GraphQLInt,
      description: 'The points awarded for answering this question correctly.',
    },
    rank: {
      type: GraphQLInt,
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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuizAnswerInfoInput))),
      description: 'The answer options of this question.',
    },
  },
});

export default QuizQuestionInfoInput;
