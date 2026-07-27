import axios from 'axios';

import { db } from '../../db/index.js';
import { ErrorType } from '../../utils/ErrorType.js';
import { uploadFile } from '../../utils/fileStorageHandler.js';
import logger from '../../utils/logger.js';

type AccountInfo = {
  sub: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

const uploadPhoto = async (googlePhotoUrl: string, userId: string) => {
  try {
    const response = await axios.get(googlePhotoUrl, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];

    if (!contentType || typeof contentType !== 'string') {
      throw new Error(ErrorType.INVALID_URL);
    }

    const extension = contentType.split('/')[1];

    if (!contentType.startsWith('image/')) {
      throw new Error(ErrorType.INVALID_URL);
    }

    const uploadedFile = await uploadFile(
      `uploads/profile-imgs/${userId}.${extension}`,
      Buffer.from(response.data),
      {
        contentType,
      },
    );

    return uploadedFile.path;
  } catch (error) {
    logger.error({ err: error }, 'Error uploading photo');
    return null;
  }
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
      const avatarUrl = picture ? await uploadPhoto(picture, sub) : null;

      const role = await db('account_role').select('id').where('code', userRole).first();

      const [account] = await db('account')
        .insert({
          email,
          name,
          first_name: given_name,
          last_name: family_name,
          avatar_url: avatarUrl,
          external_account_id: sub,
          external_account_provider: provider,
          role_id: role.id,
        })
        .returning('id');

      return account;
    }
  } catch (error) {
    logger.error({ err: error }, 'An error occurred during account creation/update');
    throw error;
  }
};

export default createOrUpdateAccount;
