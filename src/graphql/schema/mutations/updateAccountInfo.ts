import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { AccountInfoInput as AccountInfoType, Gender } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import AccountInfoInput from '../inputs/AccountInfo';
import MutationResult from '../types/MutationResult';
import { AccountRoleEnum } from '../types/enum/AccountRole';

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
        firstName,
        lastName,
        nickname,
        gender,
        nationalityId,
        countryId,
        dateOfBirth,
        teacherBio,
        teacherDescription,
        teacherSpecialty,
      } = accountInfo;

      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedNickname = nickname.trim();

      if (
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
            ...(isTeacherAccount && {
              specialty: teacherSpecialty,
              bio: teacherBio,
              description: teacherDescription,
            }),
            updated_at: db.fn.now(),
          });

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to update account information: ', error);

        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateAccountInfo;
