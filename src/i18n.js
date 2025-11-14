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

export const getBudget4WeddingData = (language = 'en') => {
  return translations[language]?.budget4Wedding || translations.en.budget4Wedding;
};

// Helper function to get nested translation
export const getNestedTranslation = (path, language = 'en') => {
  const keys = path.split('.');
  let value = translations[language] || translations.en;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // Fallback to English
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return null;
        }
      }
      break;
    }
  }
  
  return value;
};

// Helper functions for specific data types
export const getEventTypeName = (eventTypeId, language = 'en') => {
  return getNestedTranslation(`eventTypes.${eventTypeId}.name`, language);
};

export const getEventTypeDescription = (eventTypeId, language = 'en') => {
  return getNestedTranslation(`eventTypes.${eventTypeId}.description`, language);
};

export const getBudgetRangeName = (budgetId, language = 'en') => {
  return getNestedTranslation(`budgetRanges.${budgetId}.name`, language);
};

export const getBudgetRangeDescription = (budgetId, language = 'en') => {
  return getNestedTranslation(`budgetRanges.${budgetId}.description`, language);
};

export const getTimeOptionLabel = (timeValue, language = 'en') => {
  return getNestedTranslation(`timeOptions.${timeValue}.label`, language);
};

export const getTimeOptionTime = (timeValue, language = 'en') => {
  return getNestedTranslation(`timeOptions.${timeValue}.time`, language);
};

export const getBudget4TimeOptionLabel = (timeValue, language = 'en') => {
  return getNestedTranslation(`budget4TimeOptions.${timeValue}.label`, language);
};

export const getBudget4TimeOptionTime = (timeValue, language = 'en') => {
  return getNestedTranslation(`budget4TimeOptions.${timeValue}.time`, language);
};

export const getPackageName = (eventType, packageId, language = 'en') => {
  return getNestedTranslation(`packagesData.${eventType}.${packageId}.name`, language);
};

export const getPackageDescription = (eventType, packageId, language = 'en') => {
  return getNestedTranslation(`packagesData.${eventType}.${packageId}.description`, language);
};

export const getPackageArea = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesData.${eventType}.${packageId}.area`, language);
};

export const getPackageCapacity = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesData.${eventType}.${packageId}.capacity`, language);
};

// Helper to parse capacity range from string like "20-60 guests" or "20-60 คน"
export const parseCapacityRange = (capacityString) => {
  if (!capacityString) return { min: 50, max: 400 }; // Default fallback values
  
  // Extract numbers from string like "20-60 guests" or "20-60 คน"
  const match = capacityString.match(/(\d+)-(\d+)/);
  if (match) {
    return {
      min: parseInt(match[1], 10),
      max: parseInt(match[2], 10)
    };
  }
  
  return { min: 50, max: 400 }; // Default fallback values
};

// Get package detail arrays
export const getPackageFeatures = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesDetails.${eventType}.${packageId}.features`, language) || [];
};

export const getPackageEquipmentServices = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesDetails.${eventType}.${packageId}.equipmentServices`, language) || [];
};

export const getPackageFood = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesDetails.${eventType}.${packageId}.food`, language) || [];
};

export const getPackageLimits = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesDetails.${eventType}.${packageId}.limits`, language) || [];
};

// Get package shooting and teardown hours (for photo packages)
export const getPackageShootingHours = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesData.${eventType}.${packageId}.shootingHours`, language);
};

export const getPackageTeardownHours = (eventType, packageId, language) => {
  return getNestedTranslation(`packagesData.${eventType}.${packageId}.teardownHours`, language);
};

// Addons

export const getAddonName = (eventType, addonId, language = 'en') => {
  return getNestedTranslation(`budget4Wedding.items.${addonId}.name`, language) ||
         getNestedTranslation(`addons.${eventType}.items.${addonId}.name`, language);
};

export const getAddonDescription = (eventType, addonId, language = 'en') => {
  return getNestedTranslation(`budget4Wedding.items.${addonId}.description`, language) ||
         getNestedTranslation(`addons.${eventType}.items.${addonId}.description`, language);
};

export const getAddonUnit = (eventType, addonId, language = 'en') => {
  return getNestedTranslation(`budget4Wedding.items.${addonId}.unit`, language) ||
         getNestedTranslation(`addons.${eventType}.units.${addonId}`, language);
};

export const getAddonCategoryName = (eventType, categoryId, language = 'en') => {
  return getNestedTranslation(`budget4Wedding.categories.${categoryId}`, language) ||
         getNestedTranslation(`addons.${eventType}.categories.${categoryId}`, language);
};

export default translations;