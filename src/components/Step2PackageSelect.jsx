
import React from 'react'
import { getPackages } from '../data'
import PackageCard from './PackageCard'
import { useStore } from '../store'
import { getTranslations } from '../data'

export default function PackageSelect() {
  const { type, budget, language } = useStore()
  const configTranslations = getTranslations(language)
  const allPackages = getPackages(type)
  
  // Filter packages by selected budget
  const filteredPackages = budget 
    ? allPackages.filter(pkg => pkg.budgetId === budget)
    : allPackages
  
  return (
    <div className="space-y-6">
      {/* Step 2 Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{configTranslations.step3Title}</h2>
        <p className="text-gray-600">{configTranslations.step3Description}</p>
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
