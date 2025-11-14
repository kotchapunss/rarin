
import React from 'react'
import { Check } from 'lucide-react'
import { useStore } from '../store'
import { 
  useTranslations, 
  getPackageName, 
  getPackageDescription, 
  getPackageArea,
  getPackageCapacity,
  getPackageFeatures,
  getPackageEquipmentServices,
  getPackageFood,
  getPackageLimits,
  getPackageShootingHours,
  getPackageTeardownHours
} from '../i18n'

export default function PackageCard({ item, isPopular = false }) {
  const { packageId, setPackage, type, language } = useStore()
  const t = useTranslations()
  const active = packageId === item.id

  // Get translated package info using i18n helpers
  const packageInfo = {
    name: getPackageName(type, item.id, language) || item.name || '',
    description: getPackageDescription(type, item.id, language) || '',
    area: getPackageArea(type, item.id, language) || item.area || 'Standard Area',
    capacity: getPackageCapacity(type, item.id, language) || '',
    timeSlots: item.timeSlots || '06:00 - 22:00',
    features: getPackageFeatures(type, item.id, language),
    equipmentServices: getPackageEquipmentServices(type, item.id, language),
    food: getPackageFood(type, item.id, language),
    limits: getPackageLimits(type, item.id, language),
    shootingHours: getPackageShootingHours(type, item.id, language) || item.shootingHours,
    teardownHours: getPackageTeardownHours(type, item.id, language) || item.teardownHours
  }

  // Build duration display for photo packages
  const getDurationDisplay = () => {
    if (type !== 'photo') return null
    
    const shooting = packageInfo.shootingHours || 0
    const teardown = packageInfo.teardownHours || 0
    
    if (teardown > 0) {
      return `${shooting} ${t.hours} ${t.shooting} + ${teardown} ${t.hours} ${t.teardown}`
    }
    return `${shooting} ${language === 'th' ? 'ชม.' : 'hrs'}`
  }

  // Get package image for budget4 wedding packages
  const getPackageImage = () => {
    if (type !== 'wedding' && !(item.budgetId == 'budget4' || item.budgetId == 'budget3')) return null
    
    const imageMap = {
      'w5': '/Inclusive-pack.jpeg',
      'w6': '/basic-pack.jpeg',
      'w7': '/celebrate-pack.jpeg',
      'w8': '/yourstyle-pack.jpeg'
    }
    
    return imageMap[item.id] || null
  }

  // If not active, show collapsed version
  if (!active) {
    return (
      <div 
        className="relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[#d4b5a0] hover:shadow-md"
        onClick={() => setPackage(item.id)}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-2 -right-2 bg-[#B8846B] text-white text-xs px-3 py-1 rounded-full font-medium">
            {t.recommend || 'Recommend'}
          </div>
        )}

        {/* Collapsed Package Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{packageInfo.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {type === 'event' ? (
                <>
                  <span>{language === 'th' ? 'ขั้นต่ำ' : 'Min'} ฿{item.minSpend?.toLocaleString() || '0'}</span>
                  {packageInfo.capacity && (
                    <>
                      <span>•</span>
                      <span>{packageInfo.capacity}</span>
                    </>
                  )}
                </>
              ) : type === 'photo' ? (
                <>
                  <span>฿{item.price?.toLocaleString() || '0'}</span>
                  <span>•</span>
                  <span>{getDurationDisplay()}</span>
                </>
              ) : (
                <>
                  <span>฿{item.price?.toLocaleString() || '0'}</span>
                  <span>•</span>
                  <span>{packageInfo.area}</span>
                </>
              )}
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
      className="relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 border-[#c19a7e] shadow-lg"
      onClick={() => setPackage(item.id)}
    >
      {/* Recommend Badge */}
      {(isPopular || item.isPopular) && (
        <div className="absolute -top-3 left-6 bg-[#B8846B] text-white px-3 py-1 rounded-full text-sm font-semibold">
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
        <div className={`grid gap-4 mb-4 ${
          type === 'event' ? 'grid-cols-3' : 
          type === 'photo' ? 'grid-cols-3' :
          (item.timeSlots && item.timeSlots.trim() !== '' ? 'grid-cols-3' : 'grid-cols-2')
        }`}>
          {type === 'event' ? (
            <>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'ขั้นต่ำ' : 'Minimum'}</div>
                <div className="font-semibold">฿{item.minSpend?.toLocaleString() || '0'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'จำนวนคน' : 'Capacity'}</div>
                <div className="font-semibold">{packageInfo.capacity || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'พื้นที่' : 'Area'}</div>
                <div className="font-semibold">{packageInfo.area}</div>
              </div>
            </>
          ) : type === 'photo' ? (
            <>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'ราคา' : 'Price'}</div>
                <div className="font-semibold">฿{item.price?.toLocaleString() || '0'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'ระยะเวลา' : 'Duration'}</div>
                <div className="font-semibold text-sm">{getDurationDisplay()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'พื้นที่' : 'Area'}</div>
                <div className="font-semibold">{packageInfo.area}</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'ราคา' : 'Price'}</div>
                <div className="font-semibold">฿{item.price?.toLocaleString() || '0'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{language === 'th' ? 'พื้นที่' : 'Area'}</div>
                <div className="font-semibold">{packageInfo.area}</div>
              </div>
              {item.timeSlots && item.timeSlots.trim() !== '' && (
                <div>
                  <div className="text-sm text-gray-500">{language === 'th' ? 'รอบเวลา' : 'Time Slots'}</div>
                  <div className="font-semibold text-sm">{packageInfo.timeSlots}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      

      {/* Features Section */}
      {packageInfo.features && packageInfo.features.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">{t.packageIncluded}</h4>
          <ul className="space-y-1">
            {packageInfo.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#c19a7e] mr-2">•</span>
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Equipment Services Section */}
      {packageInfo.equipmentServices.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">{t.packageDecoration}</h4>
          <ul className="space-y-1">
            {packageInfo.equipmentServices.map((service, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#c19a7e] mr-2">•</span>
                <span className="text-sm text-gray-700">{service}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

       {/* food Services Section */}
      {packageInfo.food.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">{t.packageFood}</h4>
          <ul className="space-y-1">
            {packageInfo.food.map((foodItem, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#c19a7e] mr-2">•</span>
                <span className="text-sm text-gray-700">{foodItem}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* limits Services Section */}
      {packageInfo.limits.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">{t.packageLimits}</h4>
          <ul className="space-y-1">
            {packageInfo.limits.map((limit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#c19a7e] mr-2">•</span>
                <span className="text-sm text-gray-700">{limit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* Package Image for Budget4 Wedding Packages */}
      {getPackageImage() && (
        <div className="mb-4">
          <img 
            src={getPackageImage()} 
            alt={packageInfo.name}
            className="w-full object-cover rounded-m"
          />
        </div>
      )}

      {/* Selection Indicator */}
      <div className="absolute top-4 right-4">
        <div className="w-6 h-6 bg-[#c19a7e] rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
