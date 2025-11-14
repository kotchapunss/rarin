import React, { useState } from 'react'
import { useStore } from '../store'
import { useTranslations, getBudget4WeddingData } from '../i18n'
import { getAddonCategories } from '../data'

export default function AddonsSelect() {
  const { addons, toggleAddon, language, people, type, budget } = useStore()
  const translations = useTranslations()
  const [quantities, setQuantities] = useState({})
  const [activeMainTab, setActiveMainTab] = useState('')
  const [activeSubTab, setActiveSubTab] = useState('')
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [showMainLeftArrow, setShowMainLeftArrow] = useState(false)
  const [showMainRightArrow, setShowMainRightArrow] = useState(false)
  const scrollContainerRef = React.useRef(null)
  const mainTabsContainerRef = React.useRef(null)

  // Helper function to get nested translation
  const getNestedTranslation = (path) => {
    const result = path.split('.').reduce((obj, key) => obj?.[key], translations)
    // Fallback to path if translation not found
    return result || path
  }

  // Check if this is a Budget4 wedding package
  const isBudget4Wedding = type === 'wedding' && budget === 'budget4'

  // Get addon categories from config for event types
  const configAddonCategories = getAddonCategories(type)

    // Helper function to get translated addon data
  const getTranslatedAddonData = (categories) => {
    if (!categories) return {}
    
    const translatedCategories = {}
    
    Object.keys(categories).forEach(categoryKey => {
      const category = categories[categoryKey]
      translatedCategories[categoryKey] = {
        title: translations.addons?.[type]?.categories?.[categoryKey] || 
               (typeof category.title === 'object' 
                 ? (category.title[language] || category.title.th || category.title.en || '')
                 : (category.title || '')),
        items: category.items.map(item => ({
          ...item,
          name: translations.addons?.[type]?.items?.[item.id]?.name || 
                (typeof item.name === 'object' 
                  ? (item.name[language] || item.name.th || item.name.en || '')
                  : (item.name || '')),
          description: translations.addons?.[type]?.items?.[item.id]?.description || 
                      (typeof item.description === 'object' 
                        ? (item.description[language] || item.description.th || item.description.en || '')
                        : (item.description || '')),
          unit: translations.addons?.[type]?.units?.[item.id] || 
                (typeof item.unit === 'object' 
                  ? (item.unit[language] || item.unit.th || item.unit.en || '')
                  : (item.unit || ''))
        }))
      }
    })
    
    return translatedCategories
  }

  // Generate Budget4 wedding custom services from i18n data
  const getBudget4WeddingServices = () => {
    const budget4Data = getBudget4WeddingData(language)
    
    return {
      ceremony: {
        title: budget4Data.categories.ceremony,
        items: [
          {
            id: "water_blessing",
            name: budget4Data.items.water_blessing.name,
            shortName: budget4Data.items.water_blessing.shortName,
            description: budget4Data.items.water_blessing.description,
            minGuests: 50,
            price: 35000,
            type: "checkbox",
            details: budget4Data.items.water_blessing.details
          },
          {
            id: "monk_blessing",
            name: budget4Data.items.monk_blessing.name,
            shortName: budget4Data.items.monk_blessing.shortName,
            description: budget4Data.items.monk_blessing.description,
            minGuests: 30,
            price: 35000,
            type: "checkbox",
            details: budget4Data.items.monk_blessing.details
          },
          {
            id: "tea_ceremony",
            name: budget4Data.items.tea_ceremony.name,
            shortName: budget4Data.items.tea_ceremony.shortName,
            description: budget4Data.items.tea_ceremony.description,
            minGuests: 30,
            price: 35000,
            type: "checkbox",
            details: budget4Data.items.tea_ceremony.details
          },
          {
            id: "vow_ceremony",
            name: budget4Data.items.vow_ceremony.name,
            shortName: budget4Data.items.vow_ceremony.shortName,
            description: budget4Data.items.vow_ceremony.description,
            minGuests: 40,
            price: 35000,
            type: "checkbox",
            details: budget4Data.items.vow_ceremony.details
          }
        ]
      },
      food: {
        title: budget4Data.categories.food,
        items: [
          {
            id: "classic_thai_buffet",
            name: budget4Data.items.classic_thai_buffet.name,
            description: budget4Data.items.classic_thai_buffet.description,
            price: 950,
            type: "auto",
            unit: budget4Data.items.classic_thai_buffet.unit
          },
          {
            id: "deluxe_international_buffet",
            name: budget4Data.items.deluxe_international_buffet.name,
            description: budget4Data.items.deluxe_international_buffet.description,
            price: 1290,
            type: "auto",
            unit: budget4Data.items.deluxe_international_buffet.unit
          },
          {
            id: "delight_cocktail",
            name: budget4Data.items.delight_cocktail.name,
            description: budget4Data.items.delight_cocktail.description,
            price: 950,
            type: "auto",
            unit: budget4Data.items.delight_cocktail.unit
          },
          {
            id: "stylish_heavy_cocktail",
            name: budget4Data.items.stylish_heavy_cocktail.name,
            description: budget4Data.items.stylish_heavy_cocktail.description,
            price: 1590,
            type: "auto",
            unit: budget4Data.items.stylish_heavy_cocktail.unit
          },
          {
            id: "classic_chinese_table",
            name: budget4Data.items.classic_chinese_table.name,
            description: budget4Data.items.classic_chinese_table.description,
            price: 9900,
            type: "auto",
            unit: budget4Data.items.classic_chinese_table.unit
          },
          {
            id: "deluxe_chinese_table",
            name: budget4Data.items.deluxe_chinese_table.name,
            description: budget4Data.items.deluxe_chinese_table.description,
            price: 13900,
            type: "auto",
            unit: budget4Data.items.deluxe_chinese_table.unit
          },
          {
            id: "stylish_international_buffet",
            name: budget4Data.items.stylish_international_buffet.name,
            description: budget4Data.items.stylish_international_buffet.description,
            minGuests: 50,
            price: 1590,
            type: "auto",
            unit: budget4Data.items.stylish_international_buffet.unit
          },
          {
            id: "western_thai_course_menu",
            name: budget4Data.items.western_thai_course_menu.name,
            description: budget4Data.items.western_thai_course_menu.description,
            price: 1800,
            type: "auto",
            unit: budget4Data.items.western_thai_course_menu.unit
          }
        ]
      },
      liquor: {
        title: budget4Data.categories.liquor,
        items: [
          {
            id: "beer_singha",
            name: budget4Data.items.beer_singha.name,
            description: budget4Data.items.beer_singha.description,
            price: 13990,
            type: "input",
            unit: budget4Data.items.beer_singha.unit
          },
          {
            id: "cocktail",
            name: budget4Data.items.cocktail.name,
            description: budget4Data.items.cocktail.description,
            price: 29000,
            type: "input",
            unit: budget4Data.items.cocktail.unit
          }
        ]
      },
      marketing: {
        title: budget4Data.categories.marketing,
        items: [
          {
            id: "collab_program",
            name: budget4Data.items.collab_program.name,
            description: budget4Data.items.collab_program.description,
            discount: 20000,
            type: "discount"
          },
          {
            id: "social_media_collab",
            name: budget4Data.items.social_media_collab.name,
            description: budget4Data.items.social_media_collab.description,
            discount: 10000,
            type: "discount"
          }
        ]
      }
    }
  }

  // Get addon categories based on package type
  const addonCategories = isBudget4Wedding 
    ? getBudget4WeddingServices() 
    : (() => {
        const translated = getTranslatedAddonData(configAddonCategories);
        // Return translated data if it has content, otherwise return empty object
        return (translated && Object.keys(translated).length > 0) ? translated : {};
      })();

  // Define main tab structure to organize categories
  const getMainTabStructure = () => {
    if (isBudget4Wedding) {
      return {
        services: {
          title: language === 'th' ? 'พิธีหมั้น' : 'Services',
          icon: '💒',
          categories: ['ceremony']
        },
        catering: {
          title: language === 'th' ? 'อาหารและเครื่องดื่ม' : 'Food & Beverage',
          icon: '🍽️',
          categories: ['food', 'liquor']
        },
        promotions: {
          title: language === 'th' ? 'โปรโมชั่น' : 'Promotions',
          icon: '🎁',
          categories: ['marketing']
        }
      }
    } else if (type === 'event') {
      // Group event food categories under main tabs
      const eventCategories = Object.keys(addonCategories)
      const foodCategories = eventCategories.filter(cat => cat !== 'liquor' && cat !== 'coffee_break' )
      const breakCategories = eventCategories.filter(cat => cat === 'coffee_break' )
      
      return {
        catering: {
          title: language === 'th' ? 'อาหารและเครื่องดื่ม' : 'Food & Beverage',
          icon: '🍽️',
          categories: foodCategories.length > 0 ? foodCategories : []
        },
        breaks: {
          title: language === 'th' ? 'กาแฟ & ชาอาหารว่างบ่าย' : 'Coffee Break & Afternoon Tea',
          icon: '☕',
          categories: breakCategories.length > 0 ? breakCategories : []
        },
        beverages: {
          title: language === 'th' ? 'เครื่องดื่มแอลกอฮอล์' : 'Alcoholic Beverages',
          icon: '🍺',
          categories: eventCategories.includes('liquor') ? ['liquor'] : []
        }
      }
    } else {
      // Default single group for other types
      return {
        addons: {
          title: language === 'th' ? 'เสริม' : 'Add-ons',
          icon: '➕',
          categories: Object.keys(addonCategories)
        }
      }
    }
  }

  const mainTabStructure = getMainTabStructure()

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    // Check sub tabs container
    const subContainer = scrollContainerRef.current
    if (subContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = subContainer
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }

    // Check main tabs container
    const mainContainer = mainTabsContainerRef.current
    if (mainContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = mainContainer
      setShowMainLeftArrow(scrollLeft > 10)
      setShowMainRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Set default active tabs when structure changes
  React.useEffect(() => {
    const mainTabs = Object.keys(mainTabStructure)
    if (mainTabs.length > 0 && !activeMainTab) {
      const firstMainTab = mainTabs[0]
      setActiveMainTab(firstMainTab)
      
      const firstSubCategory = mainTabStructure[firstMainTab]?.categories?.[0]
      if (firstSubCategory) {
        setActiveSubTab(firstSubCategory)
      }
    }
  }, [mainTabStructure, activeMainTab])

  // Check scroll position on mount and when tabs change
  React.useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      // Also check on resize
      window.addEventListener('resize', checkScrollPosition)
      return () => {
        container.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [activeMainTab, activeSubTab])

  const handleQuantityChange = (addonId, quantity, price) => {
    const newQuantities = { ...quantities, [addonId]: quantity }
    setQuantities(newQuantities)
    
    if (quantity > 0) {
      toggleAddon(addonId, price * quantity, quantity)
    } else {
      if (addons[addonId]) {
        toggleAddon(addonId, 0, 0)
      }
    }
  }

  const handleAutoAddonToggle = (addonId, unitPrice, unit, categoryKey) => {
    const isChecked = !!addons[addonId]
    
    // For budget4 wedding, clear other selections in the same category (single selection per category)
    if (isBudget4Wedding && !isChecked) {
      // Clear other items in the same category
      const categoryItems = addonCategories[categoryKey]?.items || []
      categoryItems.forEach(item => {
        if (item.id !== addonId && addons[item.id]) {
          toggleAddon(item.id, 0)
        }
      })
    }

    // For event type coffee_break category, allow only single selection within the category
    if (type === 'event' && !isChecked && categoryKey === 'coffee_break') {
      // Clear other items in the coffee_break category
      const categoryItems = addonCategories[categoryKey]?.items || []
      categoryItems.forEach(item => {
        if (item.id !== addonId && addons[item.id]) {
          toggleAddon(item.id, 0)
        }
      })
    }

    // For event type food categories, allow only single selection ACROSS ALL food categories
    if (type === 'event' && !isChecked && categoryKey !== 'liquor' && categoryKey !== 'coffee_break') {
      // Clear ALL other food items from ALL food categories (except liquor)
      Object.keys(addonCategories).forEach(catKey => {
        if (catKey !== 'liquor' && catKey !== 'coffee_break') {
          const categoryItems = addonCategories[catKey]?.items || []
          categoryItems.forEach(item => {
            if (item.id !== addonId && addons[item.id]) {
              toggleAddon(item.id, 0)
            }
          })
        }
      })
    }
    
    if (isChecked) {
      toggleAddon(addonId, 0)
    } else {
      // Calculate price based on people count and unit
      let quantity = people || 1
      const unitText = typeof unit === 'object' ? (unit.th || unit.en || '') : unit
      if (unitText === '10 ท่าน' || unitText === '10 people') {
        quantity = Math.ceil((people || 1) / 10)
      }
      toggleAddon(addonId, unitPrice * quantity, quantity)
    }
  }

  const handleCeremonyClick = (ceremonyId, price, categoryKey) => {
    const isChecked = !!addons[ceremonyId]
    
    // For budget4 wedding, clear other selections in the same category (single selection per category)
    if (isBudget4Wedding && !isChecked) {
      // Clear other items in the same category
      const categoryItems = addonCategories[categoryKey]?.items || []
      categoryItems.forEach(item => {
        if (item.id !== ceremonyId && addons[item.id]) {
          toggleAddon(item.id, 0)
        }
      })
    }
    
    if (isChecked) {
      toggleAddon(ceremonyId, 0)
    } else {
      toggleAddon(ceremonyId, price)
    }
  }

  const handleDiscountToggle = (discountId, discountValue) => {
    const isChecked = !!addons[discountId]
    Object.keys(addons).forEach(addonId => {
      if ((addonId.includes('collab') || addonId.includes('social') || addonId.includes('marketing')) && addonId !== discountId) {
        toggleAddon(addonId, 0)
      }
    })
    if (isChecked) {
      toggleAddon(discountId, 0)
    } else {
      toggleAddon(discountId, -Math.abs(discountValue))
    }
  }

  // Helper function to handle main tab change
  const handleMainTabChange = (mainTabKey) => {
    setActiveMainTab(mainTabKey)
    const firstSubCategory = mainTabStructure[mainTabKey]?.categories?.[0]
    if (firstSubCategory) {
      setActiveSubTab(firstSubCategory)
    }
  }

  // Helper function to handle sub tab change
  const handleSubTabChange = (subTabKey) => {
    setActiveSubTab(subTabKey)
  }

  // Check if we're in wedding flow (5 steps) or other flow (4 steps)
  const isWeddingFlow = type === 'wedding'
  
  // If no addon categories found, show a message
  if (!addonCategories || Object.keys(addonCategories).length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isWeddingFlow ? translations.step5WeddingTitle : translations.step4Title}
          </h2>
          <p className="text-gray-600 mt-4">
            {language === 'th' ? 'ไม่พบรายการเสริม' : 'No add-ons available'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Type: {type}, Budget: {budget || 'N/A'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Step Header - Wedding Step 5, Others Step 4 */}
      <div className="text-center px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {isWeddingFlow ? translations.step5WeddingTitle : translations.step4Title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          {isWeddingFlow ? translations.step5WeddingDescription : translations.step4Description}
        </p>
      </div>

      {/* Main Tabs Navigation */}
      {Object.keys(mainTabStructure).length > 1 && (
        <div className="mb-8">
          <div className="relative">
            <div 
              ref={mainTabsContainerRef}
              className="overflow-x-auto scrollbar-hide"
              onScroll={checkScrollPosition}
            >
              <div className="flex gap-3 min-w-max px-1">
                {Object.entries(mainTabStructure).map(([mainTabKey, mainTabData]) => (
                  <button
                    key={mainTabKey}
                    onClick={() => handleMainTabChange(mainTabKey)}
                    className={`flex items-center justify-center px-4 py-1 text-sm font-medium transition-all rounded-full border-2 whitespace-nowrap ${
                      activeMainTab === mainTabKey
                        ? 'bg-[#B8846B] text-white border-[#B8846B]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#d4b5a0] hover:text-[#B8846B]'
                    }`}
                  >
                    <span className="mr-2 text-lg">{mainTabData.icon}</span>
                    <span className="font-medium">{mainTabData.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Left scroll indicator for main tabs */}
            {showMainLeftArrow && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none flex items-center justify-start pl-2">
                <svg className="w-4 h-4 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            )}
            
            {/* Right scroll indicator for main tabs */}
            {showMainRightArrow && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none flex items-center justify-end pr-2">
                <svg className="w-4 h-4 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub Tabs Navigation - Show when there are multiple categories in active main tab */}
      {activeMainTab && mainTabStructure[activeMainTab]?.categories?.length > 1 && (
        <div className="mb-6">
          <div className="border-b border-gray-200 relative">
            <nav 
              ref={scrollContainerRef}
              className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide pr-12" 
              aria-label="Tabs"
            >
              {mainTabStructure[activeMainTab].categories.map(categoryKey => {
                const isActive = activeSubTab === categoryKey
                const categoryTitle = getNestedTranslation(`addons.${type}.categories.${categoryKey}`) || 
                                    (addonCategories[categoryKey]?.title || categoryKey)
                
                // Check if this category has any selected items
                const hasSelectedItems = addonCategories[categoryKey]?.items?.some(item => addons[item.id]) || false
                
                return (
                  <button
                    key={categoryKey}
                    onClick={() => handleSubTabChange(categoryKey)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-all ${
                      isActive
                        ? 'border-[#B8846B] text-[#B8846B]'
                        : hasSelectedItems
                        ? 'border-transparent text-[#B8846B] hover:text-[#a0735a] hover:border-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {categoryTitle}
                  </button>
                )
              })}
            </nav>
            
            {/* Left scroll indicator */}
            {showLeftArrow && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none flex items-center justify-start pl-2">
                <svg className="w-4 h-4 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            )}
            
            {/* Right scroll indicator */}
            {showRightArrow && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none flex items-center justify-end pr-2">
                <svg className="w-4 h-4 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Content - Show content for active sub tab or single category */}
      {(() => {
        const currentCategoryKey = activeSubTab || (mainTabStructure[activeMainTab]?.categories?.[0])
        const currentCategory = addonCategories[currentCategoryKey]
        
        if (!currentCategory) return null;

        return (
          <div className="space-y-6">
            {/* Content Header */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {getNestedTranslation(`addons.${type}.categories.${currentCategoryKey}`) || 
                   currentCategory.title}
                </h3>
              </div>

              {/* Selection notes */}
              <div className="space-y-1">
                <div className="text-xs sm:text-sm text-gray-700">
                  {language === 'th' 
                    ? 'ราคายังไม่รวม VAT 7%' : 'Price excludes VAT 7%'
                  }
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  {/* Added note for imported alcohol in event type and valid for i18n*/}
                  {
                    language === 'th' && type === 'event' && currentCategoryKey === 'liquor'
                      ? 'กรณีนำเข้าแอลกอฮอล์มีเงื่อนไขที่กำหนด ทางสถานที่จัดเตรียม พนักงาน แก้ว น้ำแข็งบริการตลอดทั้งงาน'
                      : language === 'en' && type === 'event' && currentCategoryKey === 'liquor'
                        ? 'Note: For imported alcohol, specific conditions apply. The venue will provide staff, glasses, and ice throughout the event.'
                        : ''
                  }
                </div>
              </div>
            </div>
            
            <div className={`${
              currentCategoryKey === 'food' || (type === 'event' && currentCategoryKey === 'buffet') || (type === 'event' && currentCategoryKey === 'food_sets') || (type === 'event' && currentCategoryKey === 'course_menu') || (type === 'event' && currentCategoryKey === 'coffee_break') || (type === 'event' && currentCategoryKey === 'cocktail')
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
                : 'space-y-4'
            }`}>
              {currentCategory.items.map(item => {
                const checked = !!addons[item.id]
                const quantity = quantities[item.id] || 0
                const itemName = item.name

                // Checkbox type (like Ceremony Services)
                if (item.type === 'checkbox') {
                  return (
                    <div
                      key={item.id}
                      className={`relative pt-6 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6 border rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                        checked ? 'border-2 border-[#B8846B] bg-[#f9f5f3]/30' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCeremonyClick(item.id, item.price, currentCategoryKey)}
                    >
                      <div className="relative">
                        <div className="font-semibold text-stone-800 text-base sm:text-lg">{itemName}</div>
                        {item.minGuests && (
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            {translations.minimumGuests || (language === 'th' ? 'ขั้นต่ำ' : 'Min.')} {item.minGuests} {translations.guests || (language === 'th' ? 'คน' : 'guests')}
                          </div>
                        )}
                        <div className="text-sm text-stone-600 mt-1">
                          {item.description}
                        </div>
                        
                        {/* Price and checker button positioned at bottom right of content */}
                        <div className="absolute top-0 right-0 flex items-center gap-2">
                          <div className="text-sm text-stone-700 font-medium">
                            {language === "th" ? `ราคา : ฿${item.price.toLocaleString()}` : `Price: ฿${item.price.toLocaleString()}`}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (checked) {
                                toggleAddon(item.id, 0)
                              } else {
                                handleCeremonyClick(item.id, item.price, currentCategoryKey)
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2 ${
                              checked 
                                ? 'bg-[#B8846B] border-[#B8846B]' 
                                : 'border-gray-300 hover:border-[#d4b5a0]'
                            }`}
                            aria-pressed={checked}
                            title={checked ? (translations.deselect || (language === 'th' ? 'ยกเลิกการเลือก' : 'Deselect')) : (translations.select || (language === 'th' ? 'เลือก' : 'Select'))}
                          >
                            {checked && (
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {item.details && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-stone-700 mb-2">{translations.included || (language === 'th' ? 'รวมในแพ็กเกจ' : 'Included')}</div>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {item.details.slice(0, 6).map((detail, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-[#c19a7e] mr-2">•</span>
                                <span className="leading-snug">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                }

                // Input type - quantity based (like beverages)
                // Also handles 'per_bottle' and 'per_package' types for event liquor items
                if (item.type === 'input' || item.type === 'per_bottle' || item.type === 'per_package') {
                  const totalPrice = quantity * item.price
                  const itemUnit = item.unit
                  
                  return (
                    <div key={item.id} className={`relative pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 border-2 rounded-xl transition-all ${
                      checked ? 'border-[#B8846B] bg-[#f9f5f3]' : 'border-stone-300 hover:border-[#d4b5a0]'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                          <div className="text-sm text-stone-600 mt-2 leading-relaxed">
                            {item.description}
                          </div>
                          <div className={`text ${checked ? 'text-[#B8846B] font-semibold' : 'text-stone-700 font-semibold'} mt-3`}>
                            ฿{item.price.toLocaleString()} / {itemUnit}
                          </div>
                          {quantity > 0 && (
                            <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                              {translations.total || (language === 'th' ? 'ยอดรวม' : 'Total')}: ฿{totalPrice.toLocaleString()} ({quantity} / {itemUnit})
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-stone-600 mb-2 font-medium">{translations.quantity || (language === 'th' ? 'จำนวน' : 'Quantity')} {itemUnit}</div>
                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.price)}
                            className="w-20 px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-semibold focus:border-[#B8846B] focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )
                }

                // Grid type - similar to auto but with different layout (like event buffet items)
                if (item.type === 'grid') {
                  const isChecked = !!addons[item.id]
                  const itemUnit = item.unit
                  
                  // Calculate quantity and total price based on people count
                  let quantity = people || 1
                  if (item.minGuests && quantity < item.minGuests) {
                    quantity = item.minGuests
                  }
                  const totalPrice = item.price * quantity
                  
                  return (
                    <div
                      key={item.id}
                      className={`relative pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        isChecked ? 'border-[#B8846B] bg-[#f9f5f3]' : 'border-stone-300 hover:border-[#d4b5a0]'
                      }`}
                      onClick={() => handleAutoAddonToggle(item.id, item.price, item.unit, currentCategoryKey)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAutoAddonToggle(item.id, item.price, item.unit, currentCategoryKey)
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isChecked ? 'bg-[#B8846B]' : ''}`}
                        aria-pressed={isChecked}
                        title={isChecked ? (translations.deselect || (language === 'th' ? 'ยกเลิกการเลือก' : 'Deselect')) : (translations.select || (language === 'th' ? 'เลือก' : 'Select'))}
                      >
                        {isChecked && (
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="mb-3 pr-12">
                        <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                        {item.minGuests && (
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            {translations.minimumGuests || (language === 'th' ? 'ขั้นต่ำ' : 'Min.')} {item.minGuests} {translations.guests || (language === 'th' ? 'คน' : 'guests')}
                          </div>
                        )}
                        <div className="text-sm text-stone-600 mt-1">
                          {item.description}
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <div className="text-sm text-stone-600 mb-2">
                          ฿{item.price.toLocaleString()} / {itemUnit}
                        </div>
                        {isChecked && (
                          <div className="text-xs font-medium text-gray-500 bg-gray-100/50 px-3 py-1 rounded-lg inline-block mt-2">
                            {translations.total || (language === 'th' ? 'ยอดรวม' : 'Total')}: ฿{totalPrice.toLocaleString()} ({quantity} / {itemUnit})
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                // Auto type - price calculated based on number of people (like food items)
                // Also handles 'per_person' type for event food items
                if (item.type === 'auto' || item.type === 'per_person') {
                  const isChecked = !!addons[item.id]
                  const itemUnit = item.unit
                  
                  // Calculate quantity and total price
                  let quantity = people || 1
                  const unitText = item.unit
                  if (unitText === '10 ท่าน' || unitText === '10 people') {
                    quantity = Math.ceil((people || 1) / 10)
                  }
                  const totalPrice = item.price * quantity
                  
                  return (
                    <div
                      key={item.id}
                      className={`relative pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        isChecked ? 'border-[#B8846B] bg-[#f9f5f3]' : 'border-stone-300 hover:border-[#d4b5a0]'
                      }`}
                      onClick={() => handleAutoAddonToggle(item.id, item.price, item.unit, currentCategoryKey)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAutoAddonToggle(item.id, item.price, item.unit, currentCategoryKey)
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isChecked ? 'bg-[#B8846B]' : ''}`}
                        aria-pressed={isChecked}
                        title={isChecked ? (translations.deselect || (language === 'th' ? 'ยกเลิกการเลือก' : 'Deselect')) : (translations.select || (language === 'th' ? 'เลือก' : 'Select'))}
                      >
                        {isChecked && (
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="mb-3">
                        <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                        {item.minGuests && (
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            {translations.minimumGuests || (language === 'th' ? 'ขั้นต่ำ' : 'Min.')} {item.minGuests} {translations.guests || (language === 'th' ? 'คน' : 'guests')}
                          </div>
                        )}
                        <div className="text-sm text-stone-600 mt-1">
                          {item.description}
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <div className="text-sm text-stone-600 mb-2">
                          ฿{item.price.toLocaleString()} / {itemUnit}
                        </div>
                        {isChecked && (
                          <div className="text-xs font-medium text-gray-500 bg-gray-100/50 px-3 py-1 rounded-lg inline-block mt-2">
                            {translations.total || (language === 'th' ? 'ยอดรวม' : 'Total')}: ฿{totalPrice.toLocaleString()} ({quantity} / {itemUnit})
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                // Marketing discount type
                if (item.type === 'discount') {
                  const isChecked = !!addons[item.id]
                  return (
                    <div
                      key={item.id}
                      className={`relative pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        isChecked ? 'border-[#B8846B] bg-[#f9f5f3]' : 'border-stone-300 hover:border-[#d4b5a0]'
                      }`}
                      onClick={() => handleDiscountToggle(item.id, item.discount)}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                        <div className="text-sm text-stone-600 mb-3">
                          {item.description}
                        </div>
                        <div className="text-[#B8846B] font-semibold">
                          - ฿{item.discount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}