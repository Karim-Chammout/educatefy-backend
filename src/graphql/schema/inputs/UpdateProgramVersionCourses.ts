import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

const ProgramVersionCourseInput = new GraphQLInputObjectType({
  name: 'ProgramVersionCourseInput',
  description: 'Input for a single course entry in a program version.',
  fields: {
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course to link to the program version.',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The position of this course within the program version.',
    },
    prerequisiteCourseId: {
      type: GraphQLID,
      description:
        'The ID of the course that must be completed before this one. Null means no prerequisite.',
    },
  },
});

const UpdateProgramVersionCoursesInput = new GraphQLInputObjectType({
  name: 'UpdateProgramVersionCoursesInput',
  description: 'Input for updating the courses linked to the current draft version of a program.',
  fields: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program whose draft version will be updated.',
    },
    courses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProgramVersionCourseInput))),
      description:
        'The full ordered list of courses for this version. This is a full replace — existing links are deleted and re-inserted.',
    },
  },
});

export default UpdateProgramVersionCoursesInput;
