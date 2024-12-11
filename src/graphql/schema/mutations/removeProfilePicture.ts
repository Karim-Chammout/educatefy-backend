import { GraphQLFieldConfig } from 'graphql';

import { FileType } from '../../../enum/fileType';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import ChangeProfilePictureResult from '../types/ChangeProfilePictureResult';

const removeProfilePicture: GraphQLFieldConfig<null, ContextType> = {
  type: ChangeProfilePictureResult,
  description: 'Remove the profile picture of a user.',
  resolve: authenticated(async (_, __, { db, user, loaders, fs }) => {
    return db.transaction(async (knexTransaction) => {
      try {
        const oldProfilePics = await knexTransaction('file').where({
          account_id: user.id,
          file_type: FileType.Profile_Image,
        });

        oldProfilePics.forEach(async (pic) => {
          await fs.deleteFile(pic.key);
        });

        await knexTransaction('file')
          .where({
            account_id: user.id,
            file_type: FileType.Profile_Image,
          })
          .del();

        const account = loaders.Account.loadById(user.id);

        return {
          success: true,
          errors: [],
          user: account,
        };
      } catch (error) {
        console.log('Failed to remove profile picture: ', error);

        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          user: null,
        };
      }
    });
  }),
};

export default removeProfilePicture;
