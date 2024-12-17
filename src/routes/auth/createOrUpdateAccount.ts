import axios from 'axios';

import { db } from '../../db';
import { ErrorType } from '../../utils/ErrorType';
import { uploadFile } from '../../utils/fileStorageHandler';

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
    const extension = contentType.split('/')[1];

    if (!contentType.startsWith('image/')) {
      throw new Error('URL does not point to an image');
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
    console.error('Error uploading photo: ', error);
    throw error;
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
    console.error('An error occurred: ', error);
    throw error;
  }
};

export default createOrUpdateAccount;
