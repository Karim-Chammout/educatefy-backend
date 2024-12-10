import { db } from '../../db';
import { ErrorType } from '../../utils/ErrorType';

type AccountInfo = {
  sub: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

const createOrUpdateAccount = async (
  accountInfo: AccountInfo,
  provider: string,
  userRole: 'student' | 'teacher' | undefined,
) => {
  const { sub, name, given_name, family_name, email, picture } = accountInfo;

  try {
    const existingAccount = await db('account').where('email', email).first();

    // Check if user trying to login without creating an account with a user role
    if (!existingAccount && userRole === undefined) {
      throw new Error(ErrorType.SIGN_UP_FIRST);
    }

    if (existingAccount) {
      const [updatedAccount] = await db('account')
        .where('external_account_id', sub)
        .where('email', email)
        .update({
          email,
          updated_at: db.fn.now(),
        })
        .returning('id');

      return updatedAccount;
    } else {
      // else - register a new account with the specified role
      const role = await db('account_role').select('id').where('code', userRole).first();

      const [account] = await db('account')
        .insert({
          email,
          name,
          first_name: given_name,
          last_name: family_name,
          avatar_url: picture,
          external_account_id: sub,
          external_account_provider: provider,
          role_id: role.id,
        })
        .returning('id');

      return account;
    }
  } catch (error) {
    console.error('An error occurred: ', error);
    throw error;
  }
};

export default createOrUpdateAccount;
