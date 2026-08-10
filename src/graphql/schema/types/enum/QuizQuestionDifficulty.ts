import { GraphQLEnumType } from 'graphql';

export enum QuizQuestionDifficultyEnum {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

const QuizQuestionDifficulty = new GraphQLEnumType({
  name: 'QuizQuestionDifficulty',
  description: 'The difficulty level of a quiz question.',
  values: {
    easy: {
      value: 'easy',
    },
    medium: {
      value: 'medium',
    },
    hard: {
      value: 'hard',
    },
  },
});

export default QuizQuestionDifficulty;
