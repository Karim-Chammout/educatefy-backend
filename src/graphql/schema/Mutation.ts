import { GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture';
import createCourse from './mutations/createCourse';
import removeProfilePicture from './mutations/removeProfilePicture';
import updateAccountInfo from './mutations/updateAccountInfo';
import updateCourse from './mutations/updateCourse';
import updateProfile from './mutations/updateProfile';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changeProfilePicture,
    createCourse,
    removeProfilePicture,
    updateAccountInfo,
    updateCourse,
    updateProfile,
  },
});

export default Mutation;
