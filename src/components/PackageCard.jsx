
import React from 'react'
import { Check } from 'lucide-react'
import { useStore } from '../store'
import { useTranslations } from '../i18n'

export default function PackageCard({ item, isPopular = false }) {
  const { packageId, setPackage, type, language } = useStore()
  const t = useTranslations()
  const active = packageId === item.id

  // Get translated package info - use config data directly from item
  const packageInfo = {
    name: item.name?.[language] || item.name?.th || item.name || '',
    details: item.details,
    description: item.description?.[language] || item.description?.th || '',
    area: typeof item.area === 'object' ? (item.area?.[language] || item.area?.th || 'Standard Area') : (item.area || 'Standard Area'),
    timeSlots: item.timeSlots || '06:00 - 22:00',
    features: item.features || item.details || [],
    equipmentServices: item.equipmentServices || [],
    food: item.food || [],
    limits: item.limits || []
  }

  // If not active, show collapsed version
  if (!active) {
    return (
      <div 
        className="relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
        onClick={() => setPackage(item.id)}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            {t.recommend || 'Recommend'}
          </div>
        )}

        {/* Collapsed Package Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{packageInfo.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>฿{item.price.toLocaleString()}</span>
              <span>•</span>
              <span>{packageInfo.area}</span>
            </div>
          </div>
          <div className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // Active/expanded version
  return (
    <div 
      className="relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 border-orange-400 shadow-lg"
      onClick={() => setPackage(item.id)}
    >
      {/* Recommend Badge */}
      {(isPopular || item.isPopular) && (
        <div className="absolute -top-3 left-6 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {t.recommend?.toUpperCase() || 'RECOMMEND'}
        </div>
      )}

      {/* Package Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{packageInfo.name}</h3>
        {packageInfo.description && (
          <p className="text-gray-600 text-sm mb-4">{packageInfo.description}</p>
        )}
        
        {/* Price, Area, Time */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">ราคา</div>
            <div className="font-semibold">฿{item.price.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">พื้นที่</div>
            <div className="font-semibold">{packageInfo.area}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">รอบเวลา</div>
            <div className="font-semibold text-sm">{packageInfo.timeSlots}</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      {packageInfo.features && packageInfo.features.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">สิ่งที่ได้รับรวม</h4>
          <ul className="space-y-1">
            {packageInfo.features.map((feature, index) => {
              // Handle both string features and object features with language keys
              const featureText = typeof feature === 'object' 
                ? (feature[language] || feature.th || feature.en || '')
                : feature;
              
              return (
                <li key={index} className="flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  <span className="text-sm text-gray-700">{featureText}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Equipment Services Section */}
      {packageInfo.equipmentServices.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">รายการตกแต่ง</h4>
          <ul className="space-y-1">
            {packageInfo.equipmentServices.map((service, index) => {
              // Handle both string services and object services with language keys
              const serviceText = typeof service === 'object' 
                ? (service[language] || service.th || service.en || '')
                : service;
              
              return (
                <li key={index} className="flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  <span className="text-sm text-gray-700">{serviceText}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

       {/* food Services Section */}
      {packageInfo.food.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">อาหาร</h4>
          <ul className="space-y-1">
            {packageInfo.food.map((foodItem, index) => {
              // Handle both string food items and object food items with language keys
              const foodText = typeof foodItem === 'object' 
                ? (foodItem[language] || foodItem.th || foodItem.en || '')
                : foodItem;
              
              return (
                <li key={index} className="flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  <span className="text-sm text-gray-700">{foodText}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* limits Services Section */}
      {packageInfo.limits.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">ข้อจำกัด ⚠️</h4>
          <ul className="space-y-1">
            {packageInfo.limits.map((limit, index) => {
              // Handle both string limits and object limits with language keys
              const limitText = typeof limit === 'object' 
                ? (limit[language] || limit.th || limit.en || '')
                : limit;
              
              return (
                <li key={index} className="flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  <span className="text-sm text-gray-700">{limitText}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Selection Indicator */}
      <div className="absolute top-4 right-4">
        <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
