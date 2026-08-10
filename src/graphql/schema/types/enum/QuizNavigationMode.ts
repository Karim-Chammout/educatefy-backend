import { GraphQLEnumType } from 'graphql';

export enum QuizNavigationModeEnum {
  Free = 'free',
  Sequential = 'sequential',
}

const QuizNavigationMode = new GraphQLEnumType({
  name: 'QuizNavigationMode',
  description: 'How students navigate through the questions of a quiz.',
  values: {
    free: {
      value: 'free',
    },
    sequential: {
      value: 'sequential',
    },
  },
});

export default QuizNavigationMode;
