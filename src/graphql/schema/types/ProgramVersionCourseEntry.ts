import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { Course } from './Course';

export const ProgramVersionCourseEntry = new GraphQLObjectType({
  name: 'ProgramVersionCourseEntry',
  description:
    'A course entry within a program version, including its rank and prerequisite course.',
  fields: () => ({
    course: {
      type: new GraphQLNonNull(Course),
      description: 'The course in this program version.',
      resolve: async (parent, _, { loaders }) => {
        return loaders.Course.loadById(parent.course_id);
      },
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The position of this course within the program version.',
    },
    prerequisiteCourseId: {
      type: GraphQLID,
      description:
        'The ID of the course that must be completed before this one. Null means no prerequisite.',
      resolve: (parent) => parent.prerequisite_course_id ?? null,
    },
  }),
});
