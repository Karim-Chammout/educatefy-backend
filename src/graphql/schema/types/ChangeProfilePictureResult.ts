import { GraphQLObjectType } from 'graphql';

import { Account as AccountType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { Account } from './Account.js';
import { defaultMutationFields } from './MutationResult.js';

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

const ChangeProfilePictureResult = new GraphQLObjectType({
  name: 'ChangeProfilePictureResult',
  description: 'The result of the changeProfilePicture mutation.',
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

export default ChangeProfilePictureResult;
