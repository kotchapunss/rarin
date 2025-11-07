
import React from 'react'
import { getPackages } from '../data'
import PackageCard from './PackageCard'
import { useStore } from '../store'
import { useTranslations } from '../i18n'

export default function PackageSelect() {
  const { type, budget, language } = useStore()
  const translations = useTranslations()
  const allPackages = getPackages(type, language)
  
  // Check if we're in wedding flow (5 steps) or other flow (4 steps)
  const isWeddingFlow = type === 'wedding'
  
  // Filter packages by selected budget
  const filteredPackages = budget 
    ? allPackages.filter(pkg => pkg.budgetId === budget)
    : allPackages
  
  // Get event-type-specific content
  const getStepTitle = () => {
    const titleObj = isWeddingFlow ? translations.step3Title : translations.step2Title
    return typeof titleObj === 'object' ? (titleObj[type] || '') : titleObj
  }

  const getStepDescription = () => {
    const descObj = isWeddingFlow ? translations.step3Description : translations.step2Description
    return typeof descObj === 'object' ? (descObj[type] || '') : descObj
  }

  const getSubDescription = () => {
    const subDescObj = isWeddingFlow ? translations.step3SubDescription : translations.step2SubDescription
    return typeof subDescObj === 'object' ? (subDescObj[type] || '') : ''
  }

  return (
    <div className="space-y-6">
      {/* Step Header - Wedding Step 3, Others Step 2 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {getStepTitle()}
        </h2>
        <p className="text-gray-600 mb-2">
          {getStepDescription()}
        </p>
        {getSubDescription() && (
          <div className="text-sm text-gray-500 max-w-2xl mx-auto">
            {type === 'event' ? (
              <div className="space-y-2">
                {getSubDescription().split('\n').map((line, index) => (
                  <p key={index} className={index === 1 ? 'text-[#B8846B] font-medium' : ''}>
                    {line.trim()}
                  </p>
                ))}
              </div>
            ) : (
              <p>{getSubDescription()}</p>
            )}
          </div>
        )}
      </div>

      {/* Package Cards */}
      <div className="space-y-4">
        {filteredPackages.map((item, index) => (
          <PackageCard 
            key={item.id} 
            item={item} 
            isPopular={item.isPopular} // Use config data for popular
          />
        ))}
      </div>
    </div>
  )
}
