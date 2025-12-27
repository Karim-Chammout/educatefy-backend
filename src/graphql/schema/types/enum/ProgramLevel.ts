import { GraphQLEnumType } from 'graphql';

const ProgramLevel = new GraphQLEnumType({
  name: 'ProgramLevel',
  description: 'The difficulty level of a program.',
  values: {
    beginner: {
      value: 'beginner',
    },
    intermediate: {
      value: 'intermediate',
    },
    advanced: {
      value: 'advanced',
    },
  },
});

export default ProgramLevel;
