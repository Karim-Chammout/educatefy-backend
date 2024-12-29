import { ContextType } from '../../types/types';

export const getSelectedLanguageId = async (
  loaders: ContextType['loaders'],
  selectedLanguage: string,
  skipSupportedLangCheck?: boolean,
) => {
  let selectedLanguageId: number | null = null;
  const SUPPORTED_LANGUAGES = ['en', 'ar'];

  const lowerCaseLang = selectedLanguage.toLowerCase();

  if (lowerCaseLang && (skipSupportedLangCheck || SUPPORTED_LANGUAGES.includes(lowerCaseLang))) {
    const language = await loaders.Language.loadByCode(lowerCaseLang);
    selectedLanguageId = language.id;
  }

  return selectedLanguageId;
};
