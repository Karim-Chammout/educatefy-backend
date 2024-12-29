import { GraphQLEnumType } from 'graphql';

const CourseLevel = new GraphQLEnumType({
  name: 'CourseLevel',
  description: 'The difficulty level of a course.',
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

export default CourseLevel;
