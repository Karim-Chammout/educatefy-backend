import { GraphQLBoolean, GraphQLObjectType } from 'graphql';

import changeProfilePicture from './mutations/changeProfilePicture';
import updateAccountInfo from './mutations/updateAccountInfo';
import updateProfile from './mutations/updateProfile';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    isTesting: {
      type: GraphQLBoolean,
      description: 'Mutation for testing',
      resolve: () => {
        return true;
      },
    },
    changeProfilePicture,
    updateAccountInfo,
    updateProfile,
  },
});

export default Mutation;
