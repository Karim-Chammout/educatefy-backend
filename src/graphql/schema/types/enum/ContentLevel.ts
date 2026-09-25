import { GraphQLEnumType } from 'graphql';

const ContentLevel = new GraphQLEnumType({
  name: 'ContentLevel',
  description: 'The difficulty level of a course or program.',
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

export default ContentLevel;
