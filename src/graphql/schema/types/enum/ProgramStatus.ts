import { GraphQLEnumType } from 'graphql';

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
    unenrolled: {
      value: 'unenrolled',
      description: 'The user unenrolled from this program.',
    },
    completed: {
      value: 'completed',
      description: 'This program has been completed by the user.',
    },
  },
});

export default ProgramStatus;
