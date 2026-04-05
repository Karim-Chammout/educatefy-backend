import { GraphQLEnumType } from 'graphql';

const ProgramVersionStatus = new GraphQLEnumType({
  name: 'ProgramVersionStatus',
  description: 'The lifecycle status of a program version.',
  values: {
    draft: {
      value: 'draft',
    },
    published: {
      value: 'published',
    },
    archived: {
      value: 'archived',
    },
  },
});

export default ProgramVersionStatus;
