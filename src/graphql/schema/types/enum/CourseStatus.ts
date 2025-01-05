import { GraphQLEnumType } from 'graphql';

const CourseStatus = new GraphQLEnumType({
  name: 'CourseStatus',
  description: 'The status of the course for the current user.',
  values: {
    available: {
      value: 'available',
      description: 'This course is available for enrollment.',
    },
    enrolled: {
      value: 'enrolled',
      description: 'The user is currently enrolled in this course.',
    },
    unenrolled: {
      value: 'unenrolled',
      description: 'The user unenrolled from this course.',
    },
    completed: {
      value: 'completed',
      description: 'This course has been completed by the user.',
    },
  },
});

export default CourseStatus;
