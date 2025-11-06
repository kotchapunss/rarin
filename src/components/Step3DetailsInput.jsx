
import React, { useEffect } from 'react'
import { useStore } from '../store'
import { getTimeOptions, getBudget4TimeOptions, getPackages, getSettings } from '../data'
import { 
  useTranslations, 
  getBudget4TimeOptionLabel, 
  getBudget4TimeOptionTime,
  getTimeOptionLabel,
  getTimeOptionTime,
  getPackageCapacity,
  parseCapacityRange
} from '../i18n'

export default function DetailsInput() {
  const { people, period, setPeople, setPeriod, dayType, setDayType, notes, setNotes, language, type, packageId } = useStore()
  const timeOptions = getTimeOptions()
  const budget4TimeOptions = getBudget4TimeOptions()
  const translations = useTranslations()
  const settings = getSettings()
  
  // Check if we're in wedding flow to determine correct step titles
  const isWeddingFlow = type === 'wedding'
  
  // Get event-type-specific content
  const getStepTitle = () => {
    const titleObj = isWeddingFlow ? translations.step4WeddingTitle : translations.step3Title
    return typeof titleObj === 'object' ? (titleObj[type] || '') : titleObj
  }

  const getStepDescription = () => {
    const descObj = isWeddingFlow ? translations.step4WeddingDescription : translations.step3Description
    return typeof descObj === 'object' ? (descObj[type] || '') : descObj
  }

  const stepTitle = getStepTitle()
  const stepDescription = getStepDescription()
  
  // Get the selected package to access its time slots and discount eligibility
  const selectedPackage = getPackages(type).find(pkg => pkg.id === packageId)
  const isEligibleForDiscount = selectedPackage?.weekdayDiscountEligible === true
  
  // Get capacity range for the selected package
  let packageCapacity = ''
  let capacityRange = { min: 50, max: 400 }
  
  if (type === 'event' && packageId) {
    // For event type, get capacity from i18n
    packageCapacity = getPackageCapacity(type, packageId, language)
    capacityRange = parseCapacityRange(packageCapacity)
  } else if (type === 'wedding' && packageId) {
    // For wedding type, get capacity from package description
    const packageDescription = selectedPackage?.description || ''
    // Extract capacity from description like "For 50-100 guests" or "For small wedding not over 50 guests"
    const capacityMatch = packageDescription.match(/(\d+)-(\d+)\s*guests?/i)
    if (capacityMatch) {
      capacityRange = {
        min: parseInt(capacityMatch[1], 10),
        max: parseInt(capacityMatch[2], 10)
      }
    } else {
      // Check for "not over X guests" pattern
      const notOverMatch = packageDescription.match(/not over (\d+)\s*guests?/i)
      if (notOverMatch) {
        capacityRange = {
          min: settings.baseGuestLimit || 50,
          max: parseInt(notOverMatch[1], 10)
        }
      } else {
        // Default for wedding
        capacityRange = { min: settings.baseGuestLimit || 50, max: 400 }
      }
    }
  }
  
  const minGuests = capacityRange.min
  const maxGuests = capacityRange.max
  
  // Check if the selected package is budget4
  const isBudget4Package = selectedPackage?.budgetId === 'budget4'
  
  // Calculate weekday discount amount and label
  let weekdayDiscountAmount = 0
  let weekdayDiscountLabel = ''
  
  if (isBudget4Package) {
    weekdayDiscountAmount = settings.budget4WeekdayDiscount
    weekdayDiscountLabel = `-฿${weekdayDiscountAmount.toLocaleString()}`
  } else if (isEligibleForDiscount) {
    weekdayDiscountAmount = settings.weekdayDiscount
    weekdayDiscountLabel = `-฿${weekdayDiscountAmount.toLocaleString()}`
  }
  
  // Parse timeSlots from the selected package or use budget4 special options
  let availableTimeSlots
  let hasTimeSlots = true // Track if package has time slots
  
  if (isBudget4Package) {
    // Use budget4 special time options with surcharges
    availableTimeSlots = budget4TimeOptions.map(option => {
      const label = getBudget4TimeOptionLabel(option.value, language) || option.value
      const time = getBudget4TimeOptionTime(option.value, language) || ''
      return {
        value: option.value,
        label: `${label} ${time}`,
        surcharge: option.surcharge
      }
    })
  } else if (selectedPackage?.timeSlots && selectedPackage.timeSlots.trim() !== '') {
    // Use package-specific time slots only if timeSlots is not empty
    availableTimeSlots = selectedPackage.timeSlots.split(' / ').map(slot => ({
      value: slot.trim(),
      label: slot.trim(),
      surcharge: 0
    }))
  } else if (selectedPackage?.timeSlots === '' || !selectedPackage?.timeSlots) {
    // Package has no time slots or empty timeSlots - hide time selection
    hasTimeSlots = false
    availableTimeSlots = []
  } else {
    // Use default time options
    availableTimeSlots = timeOptions.map(option => {
      const label = getTimeOptionLabel(option.value, language) || option.value
      const time = getTimeOptionTime(option.value, language) || ''
      return {
        value: option.value,
        label: `${label} ${time}`,
        surcharge: 0
      }
    })
  }
  
  // Validation states (after availableTimeSlots is defined)
  const isValidPeople = people > 0
  const isValidPeriod = hasTimeSlots ? (period && period !== '' && availableTimeSlots.some(slot => slot.value === period)) : true
  const isValidDayType = dayType && dayType !== ''
  
  // Set default period if none is selected or if the current period is not available
  useEffect(() => {
    if (hasTimeSlots && availableTimeSlots.length > 0) {
      const currentPeriodExists = availableTimeSlots.some(slot => slot.value === period)
      if (!period || !currentPeriodExists) {
        setPeriod(availableTimeSlots[0].value)
      }
    } else if (!hasTimeSlots) {
      // Clear period for packages without time slots
      if (period !== '') {
        setPeriod('')
      }
    }
  }, [packageId, hasTimeSlots, period, setPeriod]) // Remove availableTimeSlots from dependencies
  
  // Set initial people count based on minimum capacity for event type
  useEffect(() => {
    if (type === 'event' && packageId && (people === 0 || people < minGuests)) {
      setPeople(minGuests)
    } else if (type === 'wedding' && packageId && people === 0) {
      // For wedding, initialize to minimum guest count (50)
      setPeople(minGuests)
    } else if (type === 'photo') {
      // For photo type, reset people count to 0 since it's not needed
      if (people !== 0) {
        setPeople(0)
      }
    }
  }, [packageId, type, minGuests, people, setPeople])
  
  // Get sub-description based on event type
  const getSubDescription = () => {
    if (isWeddingFlow) {
      return translations.step4SubDescription?.[type] || ''
    } else {
      return translations.step3SubDescription?.[type] || ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{stepTitle}</h2>
        <p className="text-gray-600 mb-2">{stepDescription}</p>
        {getSubDescription() && (
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            {getSubDescription()}
          </p>
        )}
      </div>

      {/* Guest Count Selector - Only show for wedding and event types */}
      {type !== 'photo' && (
        <div>
          <label className="block text-sm text-stone-600 mb-3">
            {translations.numberOfGuests} ({minGuests} - {maxGuests}) 
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="mb-4">
            <input 
              type="number" 
              value={people} 
              min={minGuests}
              max={maxGuests}
              onChange={(e)=>setPeople(parseInt(e.target.value||'0',10))}
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 text-lg transition-colors ${
                isValidPeople 
                  ? 'border-stone-300 focus:ring-brand-400' 
                  : 'border-red-300 focus:ring-red-400 bg-red-50'
              }`}
            />
            {!isValidPeople && (
              <p className="text-red-500 text-sm mt-1">
                {language === 'th' 
                  ? 'กรุณาระบุจำนวนแขก' 
                  : 'Please enter number of guests'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Time Period Selector - Only show if package has time slots */}
      {hasTimeSlots && (
        <div>
          <label className="block text-sm text-stone-600 mb-3">
            {translations.periodTime}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className={`grid gap-3 ${availableTimeSlots.length === 2 ? 'grid-cols-2' : availableTimeSlots.length === 3 ? 'grid-cols-3' : availableTimeSlots.length === 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {availableTimeSlots.map((slot, index) => (
              <button
                key={slot.value}
                onClick={() => setPeriod(slot.value)}
                className={`p-4 rounded-xl border text-center transition ${
                  period === slot.value 
                    ? 'border-2 border-orange-600 bg-orange-50' 
                    : 'bg-white border-stone-300 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                <div className="font-medium">{slot.label}</div>
                {slot.surcharge > 0 && (
                  <div className="text-xs mt-1 opacity-75">
                    +฿{slot.surcharge.toLocaleString()}
                  </div>
                )}
              </button>
            ))}
          </div>
          {!isValidPeriod && (
            <p className="text-red-500 text-sm mt-1">
              {language === 'th' ? 'กรุณาเลือกช่วงเวลา' : 'Please select a time period'}
            </p>
          )}
        </div>
      )}

      {/* Day Type Selector */}
      <div>
        <label className="block text-sm text-stone-600 mb-3">
          {translations.dayType || (language === 'th' ? 'ประเภทวัน' : 'Day Type')}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDayType('weekday')}
            className={`p-4 rounded-xl border text-center transition ${
              dayType === 'weekday' 
                ? 'border-2  border-orange-600' 
                : 'bg-white border-stone-300 hover:border-orange-400 hover:bg-orange-50'
            }`}
          >
            <div className="font-medium">{translations.weekday || (language === 'th' ? 'วันธรรมดา' : 'Weekday')}</div>
            {type === 'event' && (
              <div className="text-xs text-stone-500 mt-1">
                {language === 'th' ? 'จันทร์ - พฤหัสบดี' : 'Mon - Thu'}
              </div>
            )}
            {isEligibleForDiscount && weekdayDiscountLabel && (
              <div className={`text-xs mt-1 opacity-75 ${
                dayType === 'weekday' ? 'text-xs-200' : 'text-xs-600'
              }`}>
                {weekdayDiscountLabel}
              </div>
            )}
          </button>
          <button
            onClick={() => setDayType('weekend')}
            className={`p-4 rounded-xl border text-center transition ${
              dayType === 'weekend' 
                ? 'border-2 border-orange-600' 
                : 'bg-white border-stone-300 hover:border-orange-400 hover:bg-orange-50'
            }`}
          >
            <div className="font-medium">{translations.weekend || (language === 'th' ? 'วันหยุด/สุดสัปดาห์' : 'Weekend')}</div>
            {type === 'event' && (
              <div className="text-xs text-stone-500 mt-1">
                {language === 'th' ? 'ศุกร์ - อาทิตย์' : 'Fri - Sun'}
              </div>
            )}
          </button>
        </div>
        {!isValidDayType && (
          <p className="text-red-500 text-sm mt-1">
            {language === 'th' ? 'กรุณาเลือกประเภทวัน' : 'Please select day type'}
          </p>
        )}
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm text-stone-600 mb-3">
          {translations.specialRequests}
        </label>
        <textarea 
          value={notes} 
          onChange={(e)=>setNotes(e.target.value)}
          rows={4}
          placeholder={translations.placeholder}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:border-2 focus:border-orange-600"
        />
      </div>
    </div>
  )
}
