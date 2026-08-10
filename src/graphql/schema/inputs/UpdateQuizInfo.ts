import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import QuizNavigationMode from '../types/enum/QuizNavigationMode.js';
import UpdateQuizQuestionInfoInput from './UpdateQuizQuestionInfo.js';

const UpdateQuizInfoInput = new GraphQLInputObjectType({
  name: 'UpdateQuizInfoInput',
  description: 'Input for updating a quiz record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the quiz to update.',
    },
    denomination: {
      type: GraphQLString,
      description: 'The denomination of this quiz.',
    },
    is_published: {
      type: GraphQLBoolean,
      description: 'A flag to indicate whether this quiz is published or not.',
    },
    passing_score: {
      type: GraphQLInt,
      description: 'The passing score in percentage (0-100).',
    },
    max_attempts: {
      type: GraphQLInt,
      description: 'The maximum number of attempts, 0 means unlimited.',
    },
    shuffle_questions: {
      type: GraphQLBoolean,
      description: 'A flag to indicate whether the question order is shuffled per attempt.',
    },
    shuffle_answers: {
      type: GraphQLBoolean,
      description: 'A flag to indicate whether the answer order is shuffled per attempt.',
    },
    navigation_mode: {
      type: QuizNavigationMode,
      description: 'How students navigate through the questions.',
    },
    questions_per_page: {
      type: GraphQLInt,
      description: 'The number of questions shown per page (0 means all on one page).',
    },
    show_correct_answers: {
      type: GraphQLBoolean,
      description: 'Whether the correct answers are revealed to the student after submission.',
    },
    time_limit_minutes: {
      type: GraphQLInt,
      description: 'The time limit in minutes, null means no limit.',
    },
    feedback_passed: {
      type: GraphQLString,
      description: 'The overall feedback shown when the quiz is passed.',
    },
    feedback_failed: {
      type: GraphQLString,
      description: 'The overall feedback shown when the quiz is failed.',
    },
    questions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdateQuizQuestionInfoInput))),
      description: 'The full list of questions. Questions omitted from the list are deleted.',
    },
  },
});

export default UpdateQuizInfoInput;
