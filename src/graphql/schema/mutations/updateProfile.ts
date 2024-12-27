import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { ProfileDetailsInput as ProfileDetailsType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { sanitizeText } from '../../../utils/sanitizeText';
import { authenticated } from '../../utils/auth';
import { getSelectedLanguageId } from '../../utils/getSelectedLanguageId';
import ProfileDetailsInput from '../inputs/ProfileDetails';
import UpdateProfileResult from '../types/UpdateProfileResult';
import { AccountRoleEnum } from '../types/enum/AccountRole';

const updateProfile: GraphQLFieldConfig<null, ContextType> = {
  type: UpdateProfileResult,
  description: 'Updates a user profile details.',
  args: {
    profileDetails: {
      type: new GraphQLNonNull(ProfileDetailsInput),
      description: 'The profile details to update',
    },
  },
  resolve: authenticated(
    async (
      _,
      { profileDetails }: { profileDetails: ProfileDetailsType },
      { db, loaders, user },
    ) => {
      const {
        firstName,
        lastName,
        nickname,
        gender,
        nationalityId,
        countryId,
        selectedLanguage,
        dateOfBirth,
        teacherSpecialties,
        teacherBio,
        teacherDescription,
      } = profileDetails;

      const selectedLanguageId = await getSelectedLanguageId(loaders, selectedLanguage as string);

      const dataToUpdate = {
        ...(firstName && { first_name: firstName.trim() }),
        ...(lastName && { last_name: lastName.trim() }),
        ...(firstName && lastName && { name: `${firstName.trim()} ${lastName.trim()}` }),
        ...(nickname && { nickname: nickname.trim() }),
        ...(gender !== undefined && { gender }),
        ...(nationalityId !== undefined && { nationality_id: nationalityId }),
        ...(countryId !== undefined && { country_id: countryId }),
        ...(selectedLanguageId && { preferred_language_id: selectedLanguageId }),
        ...(dateOfBirth && { date_of_birth: dateOfBirth }),
        ...(teacherBio && { bio: teacherBio }),
        ...(teacherDescription && { description: sanitizeText(teacherDescription) }),
      };

      if (Object.keys(dataToUpdate).length === 0) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          user: null,
        };
      }

      try {
        const [account] = await db('account')
          .where('id', user.id)
          .update({
            ...dataToUpdate,
            updated_at: db.fn.now(),
          })
          .returning('*');

        // Update teacher specialties (account__subjects relation)
        if (teacherSpecialties && teacherSpecialties.length > 0) {
          const teacherRole = await loaders.AccountRole.loadByCode(AccountRoleEnum.Teacher);
          const isTeacherAccount = teacherRole.id === user.roleId;

          if (isTeacherAccount) {
            db.transaction(async (transaction) => {
              await transaction('account__subject').where('account_id', user.id).del();

              for (const subjectId of teacherSpecialties) {
                await transaction('account__subject').insert({
                  account_id: user.id,
                  subject_id: subjectId,
                });
              }
            });
          }
        }

        loaders.Account.loaders.byIdLoader.clear(user.id);

        return {
          success: true,
          errors: [],
          user: account,
        };
      } catch (error) {
        console.log('Failed to update profile details: ', error);

        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          user: null,
        };
      }
    },
  ),
};

export default updateProfile;
