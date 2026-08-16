import { GraphQLEnumType } from 'graphql';

export enum QuizAttemptStatusEnum {
  InProgress = 'in_progress',
  Completed = 'completed',
}

const QuizAttemptStatus = new GraphQLEnumType({
  name: 'QuizAttemptStatus',
  description: 'The status of a quiz attempt.',
  values: {
    in_progress: {
      value: 'in_progress',
    },
    completed: {
      value: 'completed',
    },
  },
});

export default QuizAttemptStatus;
