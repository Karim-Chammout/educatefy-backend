import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { AccountInfoInput as AccountInfoType, Gender } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { getSelectedLanguageId } from '../../utils/getSelectedLanguageId.js';
import { replaceTeacherSpecialties } from '../../utils/teacherSubjects.js';
import AccountInfoInput from '../inputs/AccountInfo.js';
import MutationResult from '../types/MutationResult.js';
import { AccountRoleEnum } from '../types/enum/AccountRole.js';
import logger from '../../../utils/logger.js';

const updateAccountInfo: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates a user account information.',
  args: {
    accountInfo: {
      type: new GraphQLNonNull(AccountInfoInput),
      description: 'The account information',
    },
  },
  resolve: authenticated(
    async (_, { accountInfo }: { accountInfo: AccountInfoType }, { db, user, loaders }) => {
      const {
        selectedLanguage,
        firstName,
        lastName,
        nickname,
        gender,
        nationalityId,
        countryId,
        dateOfBirth,
        teacherBio,
        teacherDescription,
        teacherSpecialties,
      } = accountInfo;

      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedNickname = nickname.trim();

      if (
        !selectedLanguage ||
        !trimmedFirstName ||
        !trimmedLastName ||
        !trimmedNickname ||
        !trimmedNickname ||
        !nationalityId ||
        !countryId ||
        !Object.values(Gender).includes(gender) ||
        !dateOfBirth
      ) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_FORM_VALUES)],
        };
      }

      try {
        const teacherRole = await loaders.AccountRole.loadByCode(AccountRoleEnum.Teacher);
        const isTeacherAccount = teacherRole.id === user.roleId;

        const selectedLanguageId = await getSelectedLanguageId(loaders, selectedLanguage);

        await db('account')
          .where('id', user.id)
          .update({
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            name: `${trimmedFirstName} ${trimmedLastName}`,
            nickname: trimmedNickname,
            nationality_id: nationalityId,
            country_id: countryId,
            gender,
            date_of_birth: dateOfBirth,
            ...(selectedLanguageId && { preferred_language_id: selectedLanguageId }),
            ...(isTeacherAccount && {
              bio: teacherBio,
              description: teacherDescription,
            }),
            updated_at: db.fn.now(),
          });

        if (isTeacherAccount && teacherSpecialties != null) {
          // Replaces (not merges) the teacher's specialties via the shared
          // validated helper — same semantics as updateProfile.
          const subjectResult = await replaceTeacherSpecialties(db, user.id, teacherSpecialties);

          if (!subjectResult.success) {
            const errors = [new Error(subjectResult.error)];
            if (subjectResult.detail) {
              errors.push(new Error(subjectResult.detail));
            }

            return {
              success: false,
              errors,
            };
          }
        }

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to update account information');

        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateAccountInfo;
