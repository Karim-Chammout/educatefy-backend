import { GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture';
import removeProfilePicture from './mutations/removeProfilePicture';
import updateAccountInfo from './mutations/updateAccountInfo';
import updateProfile from './mutations/updateProfile';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    changeProfilePicture,
    removeProfilePicture,
    updateAccountInfo,
    updateProfile,
  },
});

export default Mutation;
