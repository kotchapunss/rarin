
import config from './config.json'
import { 
  getPackageName, 
  getPackageDescription, 
  getPackageArea,
  getAddonName,
  getAddonDescription,
  getAddonUnit
} from './i18n.js'

// Export config for direct access when needed
export { config }

// Convert config format to existing format for backward compatibility
export const PACKAGES = {}
export const ADDONS = {}

// Build PACKAGES from config with i18n support
export function buildPackages(language = 'en') {
  const packages = {}
  
  Object.keys(config.packages).forEach(type => {
    packages[type] = config.packages[type].map(pkg => ({
      id: pkg.id,
      name: getPackageName(type, pkg.id, language) || pkg.id,
      price: pkg.price,
      details: pkg.features,
      // Additional data for enhanced package cards
      description: getPackageDescription(type, pkg.id, language) || '',
      area: getPackageArea(type, pkg.id, language) || pkg.area || '',
      timeSlots: pkg.timeSlots,
      features: pkg.features,
      equipmentServices: pkg.equipmentServices,
      isPopular: pkg.isPopular,
      weekdayDiscountEligible: pkg.weekdayDiscountEligible,
      budgetId: pkg.budgetId,
      limits: pkg.limits,
      food: pkg.food,
      minSpend: pkg.minSpend,
      capacity: pkg.capacity,
      duration: pkg.duration
    }))
  })
  
  return packages
}

// Build ADDONS from config with i18n support
export function buildAddons(language = 'en') {
  const addons = {}
  
  Object.keys(config.addons).forEach(type => {
    addons[type] = {}
    Object.keys(config.addons[type]).forEach(category => {
      addons[type][category] = config.addons[type][category].items.map(addon => ({
        id: addon.id,
        name: getAddonName(type, addon.id, language) || addon.id,
        description: getAddonDescription(type, addon.id, language) || addon.id,
        price: addon.price,
        type: addon.type,
        unit: getAddonUnit(type, addon.id, language) || addon.unit || 'person',
        minGuests: addon.minGuests
      }))
    })
  })
  
  return addons
}

// Initialize with default language
Object.assign(PACKAGES, buildPackages('en'))
Object.assign(ADDONS, buildAddons('en'))

// Update packages and addons when language changes
export function updateLanguage(language) {
  // Clear existing data
  Object.keys(PACKAGES).forEach(key => delete PACKAGES[key])
  Object.keys(ADDONS).forEach(key => delete ADDONS[key])
  
  // Rebuild with new language
  Object.assign(PACKAGES, buildPackages(language))
  Object.assign(ADDONS, buildAddons(language))
}

export function packageByType(type, language = 'en') {
  const packages = buildPackages(language)
  return packages[type] || []
}

export function addonsByType(type, language = 'en') {
  const addons = buildAddons(language)
  return addons[type] || {}
}

export function getBudgetRanges() {
  return config.budgetRanges
}

// Helper functions to get config data
export function getEventTypes() {
  return config.eventTypes
}

export function getTimeOptions() {
  return config.timeOptions
}

export function getBudget4TimeOptions() {
  return config.budget4TimeOptions
}

export function getGuestRanges() {
  return config.guestRanges
}

export function getAddons(type, language = 'en') {
  // Flatten the addons structure to match original format
  const addons = {}
  const categoryData = config.addons[type] || {}
  
  Object.values(categoryData).forEach(category => {
    category.items.forEach(addon => {
      addons[addon.id] = {
        ...addon,
        name: getAddonName(type, addon.id, language) || addon.id,
        description: getAddonDescription(type, addon.id, language) || addon.id,
        unit: getAddonUnit(type, addon.id, language) || addon.unit || 'person'
      }
    })
  })
  
  return addons
}

export function getAddonCategories(type) {
  // Get addons by category for a specific event type
  return config.addons[type] || {}
}

export function getPackages(type, language = 'en') {
  const packages = buildPackages(language)
  return packages[type] || []
}

export function getSettings() {
  return config.settings
}