import { ContextType } from '../../types/types';
import { AccountRoleEnum } from '../schema/types/enum/AccountRole';

export const hasTeacherRole = async (loaders: ContextType['loaders'], roleId: number) => {
  const accountRole = await loaders.AccountRole.loadById(roleId);

  if (accountRole && accountRole.code === AccountRoleEnum.Teacher) {
    return true;
  }

  return false;
};
