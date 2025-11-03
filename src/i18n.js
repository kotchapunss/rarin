import { useStore } from './store';
import en from './languages/en.json';
import th from './languages/th.json';

const translations = { en, th };

export const useTranslations = () => {
  const { language } = useStore();
  return translations[language] || translations.en;
};

export const getTranslation = (key, language = 'en') => {
  return translations[language][key] || translations.en[key];
};

export default translations;