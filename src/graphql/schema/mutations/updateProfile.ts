import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { ProfileDetailsInput as ProfileDetailsType } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { getSelectedLanguageId } from '../../utils/getSelectedLanguageId.js';
import { replaceTeacherSpecialties } from '../../utils/teacherSubjects.js';
import ProfileDetailsInput from '../inputs/ProfileDetails.js';
import UpdateProfileResult from '../types/UpdateProfileResult.js';
import { AccountRoleEnum } from '../types/enum/AccountRole.js';
import logger from '../../../utils/logger.js';

class TransactionAbortedWithSubjectError extends Error {
  constructor(public readonly subjectError: { error: ErrorType; detail?: string }) {
    super('Teacher specialties update failed');
    this.name = 'TransactionAbortedWithSubjectError';
  }
}

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

      let selectedLanguageId = null;
      if (selectedLanguage) {
        selectedLanguageId = await getSelectedLanguageId(loaders, selectedLanguage);
      }

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
        ...(teacherDescription && { description: teacherDescription }),
      };

      const teacherRole = await loaders.AccountRole.loadByCode(AccountRoleEnum.Teacher);
      const isTeacherAccount = teacherRole.id === user.roleId;
      // Specialties are replaced (not merged) and validated server-side; an
      // empty array is rejected by the shared helper (min 1 specialty).
      const hasSpecialtyUpdate = isTeacherAccount && teacherSpecialties != null;

      if (Object.keys(dataToUpdate).length === 0 && !hasSpecialtyUpdate) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          user: null,
        };
      }

      try {
        const result = await db.transaction(async (transaction) => {
          let account = null;
          let subjectError: { error: ErrorType; detail?: string } | null = null;

          if (Object.keys(dataToUpdate).length > 0) {
            [account] = await transaction('account')
              .where('id', user.id)
              .update({
                ...dataToUpdate,
                updated_at: transaction.fn.now(),
              })
              .returning('*');
          }

          if (hasSpecialtyUpdate) {
            const subjectResult = await replaceTeacherSpecialties(
              transaction,
              user.id,
              teacherSpecialties ?? [],
            );

            if (!subjectResult.success) {
              subjectError = { error: subjectResult.error, detail: subjectResult.detail };
            }
          }

          if (subjectError) {
            throw new TransactionAbortedWithSubjectError(subjectError);
          }

          if (!account) {
            account = await transaction('account').where('id', user.id).first();
          }

          return account;
        });

        loaders.Account.loaders.byIdLoader.clear(user.id);

        return {
          success: true,
          errors: [],
          user: result,
        };
      } catch (error) {
        if (error instanceof TransactionAbortedWithSubjectError) {
          const errors = [new Error(error.subjectError.error)];
          if (error.subjectError.detail) {
            errors.push(new Error(error.subjectError.detail));
          }

          return {
            success: false,
            errors,
            user: null,
          };
        }

        logger.error({ err: error, userId: user.id }, 'Failed to update profile details');

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
