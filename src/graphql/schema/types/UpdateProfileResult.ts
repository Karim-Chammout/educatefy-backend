import { GraphQLObjectType } from 'graphql';

import { Account as AccountType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { Account } from './Account';
import { defaultMutationFields } from './MutationResult';

type MutationResultType =
  | {
      success: true;
      errors: [];
      user: AccountType;
    }
  | {
      success: false;
      errors: Error[];
      user: null;
    };

const UpdateProfileResult = new GraphQLObjectType({
  name: 'UpdateProfileResult',
  description: 'The result of the updateProfile mutation.',
  fields: {
    ...defaultMutationFields,
    user: {
      type: Account,
      description: 'The updated user information.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders, user }) => {
        if (parent.success) {
          const account = await loaders.Account.loadById(user.id);

          return account;
        }

        return null;
      }),
    },
  },
});

export default UpdateProfileResult;
