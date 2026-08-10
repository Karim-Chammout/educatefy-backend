import { GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture.js';
import createContentComponent from './mutations/createContentComponent.js';
import createCourse from './mutations/createCourse.js';
import createCourseSection from './mutations/createCourseSection.js';
import createLesson from './mutations/createLesson.js';
import createProgram from './mutations/createProgram.js';
import createProgramVersion from './mutations/createProgramVersion.js';
import createQuiz from './mutations/createQuiz.js';
import deleteContentComponent from './mutations/deleteContentComponent.js';
import deleteCourse from './mutations/deleteCourse.js';
import deleteCourseRating from './mutations/deleteCourseRating.js';
import deleteCourseSection from './mutations/deleteCourseSection.js';
import deleteCourseSectionItem from './mutations/deleteCourseSectionItem.js';
import deleteLesson from './mutations/deleteLesson.js';
import deleteProgram from './mutations/deleteProgram.js';
import enrollInProgram from './mutations/enrollInProgram.js';
import followTeacher from './mutations/followTeacher.js';
import publishProgramVersion from './mutations/publishProgramVersion.js';
import rateCourse from './mutations/rateCourse.js';
import removeProfilePicture from './mutations/removeProfilePicture.js';
import revokeAllSessions from './mutations/revokeAllSessions.js';
import revokeDeviceSessions from './mutations/revokeDeviceSessions.js';
import startQuiz from './mutations/startQuiz.js';
import submitQuiz from './mutations/submitQuiz.js';
import unenrollFromProgram from './mutations/unenrollFromProgram.js';
import updateAccountInfo from './mutations/updateAccountInfo.js';
import updateContentComponent from './mutations/updateContentComponent.js';
import updateContentComponentProgress from './mutations/updateContentComponentProgress.js';
import updateContentComponentRanks from './mutations/updateContentComponentRank.js';
import updateCourse from './mutations/updateCourse.js';
import updateCourseSection from './mutations/updateCourseSection.js';
import updateCourseSectionItemRanks from './mutations/updateCourseSectionItemRank.js';
import updateCourseSectionRanks from './mutations/updateCourseSectionRank.js';
import updateCourseStatus from './mutations/updateCourseStatus.js';
import updateLesson from './mutations/updateLesson.js';
import updateProfile from './mutations/updateProfile.js';
import updateProgram from './mutations/updateProgram.js';
import updateProgramVersionCourses from './mutations/updateProgramVersionCourses.js';
import updateQuiz from './mutations/updateQuiz.js';
import updateQuizAnswerRanks from './mutations/updateQuizAnswerRanks.js';
import updateQuizQuestionRanks from './mutations/updateQuizQuestionRanks.js';
import upgradeToLatestProgramVersion from './mutations/upgradeToLatestProgramVersion.js';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changeProfilePicture,
    createContentComponent,
    createCourse,
    createCourseSection,
    createLesson,
    createProgram,
    createProgramVersion,
    createQuiz,
    deleteContentComponent,
    deleteCourse,
    deleteCourseRating,
    deleteCourseSection,
    deleteCourseSectionItem,
    deleteLesson,
    deleteProgram,
    enrollInProgram,
    followTeacher,
    publishProgramVersion,
    rateCourse,
    removeProfilePicture,
    revokeAllSessions,
    revokeDeviceSessions,
    startQuiz,
    submitQuiz,
    unenrollFromProgram,
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
    updateProgramVersionCourses,
    updateQuiz,
    updateQuizAnswerRanks,
    updateQuizQuestionRanks,
    upgradeToLatestProgramVersion,
  },
});

export default Mutation;
