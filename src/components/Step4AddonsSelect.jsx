import React, { useState } from 'react'
import { useStore } from '../store'
import { useTranslations } from '../i18n'
import { getAddonCategories } from '../data'

export default function AddonsSelect() {
  const { addons, toggleAddon, language, people, type } = useStore()
  const translations = useTranslations()
  const [quantities, setQuantities] = useState({})
  const [activeTab, setActiveTab] = useState('')

  // Get all addons from config based on event type
  const addonCategories = getAddonCategories(type)

  // Set default active tab when addonCategories changes
  React.useEffect(() => {
    if (Object.keys(addonCategories).length > 0 && !activeTab) {
      setActiveTab(Object.keys(addonCategories)[0])
    }
  }, [addonCategories, activeTab])

  const handleQuantityChange = (addonId, quantity, price) => {
    const newQuantities = { ...quantities, [addonId]: quantity }
    setQuantities(newQuantities)
    
    if (quantity > 0) {
      toggleAddon(addonId, price * quantity)
    } else {
      if (addons[addonId]) {
        toggleAddon(addonId, 0)
      }
    }
  }

  const handleCeremonyClick = (ceremonyId, price) => {
    const isChecked = !!addons[ceremonyId]
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

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {translations.chooseServices}
        </h2>
        <p className="text-gray-600">
          {type === 'wedding' 
            ? translations.selectWeddingServices
            : type === 'event'
            ? translations.selectEventServices
            : translations.selectPhotoServices
          }
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {Object.entries(addonCategories).map(([categoryKey, categoryData]) => (
          <button
            key={categoryKey}
            onClick={() => setActiveTab(categoryKey)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === categoryKey
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {categoryData.title[language] || categoryData.title.th}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      {activeTab && addonCategories[activeTab] && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 pb-2 border-b border-stone-200">
            {addonCategories[activeTab].title[language] || addonCategories[activeTab].title.th}
            {activeTab === 'food' && (
              <div className="text-sm font-normal text-stone-500 mt-1">
                {translations.priceExcludesVat}
              </div>
            )}
          </h3>
          
          <div className={`${activeTab === 'food' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
            {addonCategories[activeTab].items.map(item => {
              const checked = !!addons[item.id]
              const quantity = quantities[item.id] || 0
              const itemName = item.name[language] || item.name.th

              // Checkbox type (like Ceremony Services)
              if (item.type === 'checkbox') {
                return (
                  <div
                    key={item.id}
                    className={`relative pt-10 px-6 pb-6 border rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                      checked ? 'border-2 border-orange-500 bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCeremonyClick(item.id, item.price)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (checked) {
                          toggleAddon(item.id, 0)
                        } else {
                          toggleAddon(item.id, item.price)
                        }
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                      aria-pressed={checked}
                      title={checked ? translations.deselect : translations.select}
                    >
                      {checked && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="mb-3">
                      <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                      {item.minGuests && (
                        <div className="text-xs text-gray-500 font-medium mt-1">
                          {language === 'th' ? `ขั้นต่ำ ${item.minGuests} คน` : `Min. ${item.minGuests} guests`}
                        </div>
                      )}
                      <div className="text-sm text-stone-600 mt-1">{item.description}</div>
                    </div>

                    <div className="absolute top-12 right-3 text-right text-sm">
                      <span className="text-stone-500 text-xs mr-2">{translations.price}</span>
                      <span className="text-stone-700">฿{item.price.toLocaleString()}</span>
                    </div>

                    {item.details && (
                      <div>
                        <div className="text-sm font-medium text-stone-700 mb-2">{translations.included}</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {item.details.slice(0, 6).map((d, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-orange-400 mr-2">•</span>
                              <span className="leading-snug">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              }

              // Input type - quantity based (like beverages)
              if (item.type === 'input') {
                const totalPrice = quantity * item.price
                return (
                  <div key={item.id} className={`relative pt-8 px-4 pb-4 border-2 rounded-xl transition-all ${
                    checked ? 'border-orange-500 bg-orange-50' : 'border-stone-300 hover:border-orange-300'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                        <div className="text-sm text-stone-600 mt-2 leading-relaxed">{item.description}</div>
                        <div className={`text ${checked ? 'text-orange-600 font-semibold' : 'text-stone-700 font-semibold'} mt-3`}>
                          ฿{item.price.toLocaleString()} / {item.unit}
                        </div>
                        {quantity > 0 && (
                          <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                            {translations.total}: ฿{totalPrice.toLocaleString()} ({quantity} {item.unit})
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-stone-600 mb-2 font-medium">{translations.quantity} {item.unit}</div>
                        <input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.price)}
                          className="w-20 px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-semibold focus:border-orange-500 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
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
                    className={`relative pt-8 px-4 pb-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      isChecked ? 'border-orange-500 bg-orange-50' : 'border-stone-300 hover:border-orange-300'
                    }`}
                    onClick={() => handleDiscountToggle(item.id, item.discount)}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                      <div className="text-sm text-stone-600 mb-3">{item.description}</div>
                      <div className="text-orange-600 font-semibold">
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
      )}
    </div>
  )
}