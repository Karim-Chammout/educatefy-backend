import { GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture';
import createCourse from './mutations/createCourse';
import createCourseSection from './mutations/createCourseSection';
import createLesson from './mutations/createLesson';
import deleteCourse from './mutations/deleteCourse';
import deleteCourseSection from './mutations/deleteCourseSection';
import deleteCourseSectionItem from './mutations/deleteCourseSectionItem';
import deleteLesson from './mutations/deleteLesson';
import removeProfilePicture from './mutations/removeProfilePicture';
import updateAccountInfo from './mutations/updateAccountInfo';
import updateCourse from './mutations/updateCourse';
import updateCourseSection from './mutations/updateCourseSection';
import updateCourseSectionRanks from './mutations/updateCourseSectionRank';
import updateCourseSectionItemRanks from './mutations/updateCourseSectionItemRank';
import updateCourseStatus from './mutations/updateCourseStatus';
import updateLesson from './mutations/updateLesson';
import updateProfile from './mutations/updateProfile';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changeProfilePicture,
    createCourse,
    createCourseSection,
    createLesson,
    deleteCourse,
    deleteCourseSection,
    deleteCourseSectionItem,
    deleteLesson,
    removeProfilePicture,
    updateAccountInfo,
    updateCourse,
    updateCourseSection,
    updateCourseSectionRanks,
    updateCourseSectionItemRanks,
    updateCourseStatus,
    updateLesson,
    updateProfile,
  },
});

export default Mutation;
