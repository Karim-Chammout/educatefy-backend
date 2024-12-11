import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { FileType } from '../../../enum/fileType';
import { ProfilePictureDetailsInput as ProfilePictureDetailsInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import ProfilePictureDetailsInput from '../inputs/ProfilePictureDetails';
import ChangeProfilePictureResult from '../types/ChangeProfilePictureResult';

const changeProfilePicture: GraphQLFieldConfig<null, ContextType> = {
  type: ChangeProfilePictureResult,
  description: 'Change the profile picture of a user.',
  args: {
    profilePictureDetails: {
      type: new GraphQLNonNull(ProfilePictureDetailsInput),
      description: 'The details of the profile picture',
    },
  },
  resolve: authenticated(
    async (
      _,
      { profilePictureDetails }: { profilePictureDetails: ProfilePictureDetailsInputType },
      { db, user, fs },
    ) => {
      const { filePath, fileSize, mimeType, originalFileName, uuid } = profilePictureDetails;

      if (!filePath || !fileSize || !mimeType || !originalFileName || !uuid) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          user: null,
        };
      }

      return db.transaction(async (knexTransaction) => {
        try {
          // Remove the old profile picture first
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

          // Insert the new profile picture
          await knexTransaction('file').insert({
            uuid: uuid,
            file_name: originalFileName,
            file_type: FileType.Profile_Image,
            key: filePath,
            size_in_bytes: fileSize,
            mime_type: mimeType,
            account_id: user.id,
          });

          const [account] = await knexTransaction('account')
            .where('id', user.id)
            .update({
              avatar_url: null,
              updated_at: db.fn.now(),
            })
            .returning('avatar_url');

          return {
            success: true,
            errors: [],
            user: account,
          };
        } catch (error) {
          console.log('Failed to update profile picture: ', error);

          return {
            success: false,
            errors: [new Error(ErrorType.UPDATING_PROFILE_PIC_FAILED)],
            user: null,
          };
        }
      });
    },
  ),
};

export default changeProfilePicture;
