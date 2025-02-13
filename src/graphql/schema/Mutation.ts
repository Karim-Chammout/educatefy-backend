import { GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture';
import createContentComponent from './mutations/createContentComponent';
import createCourse from './mutations/createCourse';
import createCourseSection from './mutations/createCourseSection';
import createLesson from './mutations/createLesson';
import deleteContentComponent from './mutations/deleteContentComponent';
import deleteCourse from './mutations/deleteCourse';
import deleteCourseSection from './mutations/deleteCourseSection';
import deleteCourseSectionItem from './mutations/deleteCourseSectionItem';
import deleteLesson from './mutations/deleteLesson';
import removeProfilePicture from './mutations/removeProfilePicture';
import updateAccountInfo from './mutations/updateAccountInfo';
import updateContentComponentRanks from './mutations/updateContentComponentRank';
import updateCourse from './mutations/updateCourse';
import updateCourseSection from './mutations/updateCourseSection';
import updateCourseSectionItemRanks from './mutations/updateCourseSectionItemRank';
import updateCourseSectionRanks from './mutations/updateCourseSectionRank';
import updateCourseStatus from './mutations/updateCourseStatus';
import updateLesson from './mutations/updateLesson';
import updateProfile from './mutations/updateProfile';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changeProfilePicture,
    createContentComponent,
    createCourse,
    createCourseSection,
    createLesson,
    deleteContentComponent,
    deleteCourse,
    deleteCourseSection,
    deleteCourseSectionItem,
    deleteLesson,
    removeProfilePicture,
    updateAccountInfo,
    updateContentComponentRanks,
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
