/**
 * Language helper utilities to safely handle multilingual text objects
 */

/**
 * Safely gets text from a multilingual object or string
 * @param {Object|string} textObj - The text object or string
 * @param {string} language - The preferred language ('th' or 'en')
 * @param {string} fallback - Fallback text if nothing is found
 * @returns {string} The text in the preferred language or fallback
 */
export function getLocalizedText(textObj, language = 'th', fallback = '') {
  if (!textObj) return fallback
  
  // If it's already a string, return it
  if (typeof textObj === 'string') {
    return textObj || fallback
  }
  
  // If it's an object with language keys
  if (typeof textObj === 'object') {
    return (
      textObj[language] || 
      textObj.th || 
      textObj.en || 
      fallback
    )
  }
  
  return fallback
}

/**
 * Safely gets package name
 * @param {Object} pkg - Package object
 * @param {string} language - Preferred language
 * @returns {string} Package name
 */
export function getPackageName(pkg, language = 'th') {
  return getLocalizedText(pkg?.name, language, '')
}

/**
 * Safely gets package description
 * @param {Object} pkg - Package object
 * @param {string} language - Preferred language
 * @returns {string} Package description
 */
export function getPackageDescription(pkg, language = 'th') {
  return getLocalizedText(pkg?.description, language, '')
}

/**
 * Safely gets package area
 * @param {Object} pkg - Package object
 * @param {string} language - Preferred language
 * @returns {string} Package area
 */
export function getPackageArea(pkg, language = 'th') {
  return getLocalizedText(pkg?.area, language, 'Standard Area')
}

/**
 * Safely gets addon name
 * @param {Object} addon - Addon object
 * @param {string} language - Preferred language
 * @returns {string} Addon name
 */
export function getAddonName(addon, language = 'th') {
  return getLocalizedText(addon?.name, language, '')
}

/**
 * Safely gets feature text
 * @param {Object|string} feature - Feature object or string
 * @param {string} language - Preferred language
 * @returns {string} Feature text
 */
export function getFeatureText(feature, language = 'th') {
  return getLocalizedText(feature, language, '')
}