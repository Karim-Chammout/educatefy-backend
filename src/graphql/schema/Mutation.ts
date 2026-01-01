import { GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture';
import createContentComponent from './mutations/createContentComponent';
import createCourse from './mutations/createCourse';
import createCourseSection from './mutations/createCourseSection';
import createLesson from './mutations/createLesson';
import createProgram from './mutations/createProgram';
import deleteContentComponent from './mutations/deleteContentComponent';
import deleteCourse from './mutations/deleteCourse';
import deleteCourseRating from './mutations/deleteCourseRating';
import deleteCourseSection from './mutations/deleteCourseSection';
import deleteCourseSectionItem from './mutations/deleteCourseSectionItem';
import deleteLesson from './mutations/deleteLesson';
import deleteProgram from './mutations/deleteProgram';
import followTeacher from './mutations/followTeacher';
import rateCourse from './mutations/rateCourse';
import removeProfilePicture from './mutations/removeProfilePicture';
import updateAccountInfo from './mutations/updateAccountInfo';
import updateContentComponent from './mutations/updateContentComponent';
import updateContentComponentProgress from './mutations/updateContentComponentProgress';
import updateContentComponentRanks from './mutations/updateContentComponentRank';
import updateCourse from './mutations/updateCourse';
import updateCourseSection from './mutations/updateCourseSection';
import updateCourseSectionItemRanks from './mutations/updateCourseSectionItemRank';
import updateCourseSectionRanks from './mutations/updateCourseSectionRank';
import updateCourseStatus from './mutations/updateCourseStatus';
import updateLesson from './mutations/updateLesson';
import updateProfile from './mutations/updateProfile';
import updateProgram from './mutations/updateProgram';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changeProfilePicture,
    createContentComponent,
    createCourse,
    createCourseSection,
    createLesson,
    createProgram,
    deleteContentComponent,
    deleteCourse,
    deleteCourseRating,
    deleteCourseSection,
    deleteCourseSectionItem,
    deleteLesson,
    deleteProgram,
    followTeacher,
    rateCourse,
    removeProfilePicture,
    updateAccountInfo,
    updateContentComponent,
    updateContentComponentProgress,
    updateContentComponentRanks,
    updateCourse,
    updateCourseSection,
    updateCourseSectionRanks,
    updateCourseSectionItemRanks,
    updateCourseStatus,
    updateLesson,
    updateProfile,
    updateProgram,
  },
});

export default Mutation;
