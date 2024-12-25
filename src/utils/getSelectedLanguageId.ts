import { ContextType } from '../types/types';

export const getSelectedLanguageId = async (
  loaders: ContextType['loaders'],
  selectedLanguage: string,
) => {
  let selectedLanguageId: number | null = null;
  const SUPPORTED_LANGUAGES = ['en', 'ar'];

  if (selectedLanguage && SUPPORTED_LANGUAGES.includes(selectedLanguage)) {
    const language = await loaders.Language.loadByCode(selectedLanguage);
    selectedLanguageId = language.id;
  }

  return selectedLanguageId;
};
