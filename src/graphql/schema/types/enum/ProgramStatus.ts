import { GraphQLEnumType } from 'graphql';

export enum ProgramStatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

const ProgramStatus = new GraphQLEnumType({
  name: 'ProgramStatus',
  description: 'The status of the program for the current user.',
  values: {
    not_started: {
      value: 'not_started',
      description: 'This program is not started yet.',
    },
    in_progress: {
      value: 'in_progress',
      description: 'The user is currently in progress in this program.',
    },
    completed: {
      value: 'completed',
      description: 'This program has been completed by the user.',
    },
  },
});

export default ProgramStatus;
