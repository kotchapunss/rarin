
import config from './config.json'

// Export config for direct access when needed
export { config }

// Convert config format to existing format for backward compatibility
export const PACKAGES = {}
export const ADDONS = {}

// Build PACKAGES from config
Object.keys(config.packages).forEach(type => {
  PACKAGES[type] = config.packages[type].map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    details: pkg.features,
    // Additional data for enhanced package cards
    description: pkg.description,
    area: pkg.area,
    timeSlots: pkg.timeSlots,
    features: pkg.features,
    equipmentServices: pkg.equipmentServices,
    isPopular: pkg.isPopular
  }))
})

// Build ADDONS from config
Object.keys(config.addons).forEach(type => {
  ADDONS[type] = {}
  Object.keys(config.addons[type]).forEach(category => {
    ADDONS[type][category] = config.addons[type][category].items.map(addon => ({
      id: addon.id,
      name: addon.name.th, // Default to Thai
      description: addon.description,
      price: addon.price,
      type: addon.type,
      unit: addon.unit
    }))
  })
})

export function packageByType(type) {
  return PACKAGES[type] || []
}

export function addonsByType(type) {
  return ADDONS[type] || {}
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

export function getTranslations(language = 'th') {
  return config.translations[language] || config.translations.th
}

export function getAddons(type) {
  // Flatten the addons structure to match original format
  const addons = {}
  const categoryData = config.addons[type] || {}
  
  Object.values(categoryData).forEach(category => {
    category.items.forEach(addon => {
      addons[addon.id] = {
        ...addon,
        name: addon.name.th // Default to Thai for backward compatibility
      }
    })
  })
  
  return addons
}

export function getAddonCategories(type) {
  // Get addons by category for a specific event type
  return config.addons[type] || {}
}

export function getPackages(type) {
  return config.packages[type] || []
}

export function getSettings() {
  return config.settings
}