import { GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture';
import createCourse from './mutations/createCourse';
import createLesson from './mutations/createLesson';
import deleteCourse from './mutations/deleteCourse';
import removeProfilePicture from './mutations/removeProfilePicture';
import updateAccountInfo from './mutations/updateAccountInfo';
import updateCourse from './mutations/updateCourse';
import updateCourseStatus from './mutations/updateCourseStatus';
import updateProfile from './mutations/updateProfile';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changeProfilePicture,
    createCourse,
    createLesson,
    deleteCourse,
    removeProfilePicture,
    updateAccountInfo,
    updateCourse,
    updateCourseStatus,
    updateProfile,
  },
});

export default Mutation;
