
import React, { useEffect } from 'react'
import { useStore } from '../store'
import { getTimeOptions, getBudget4TimeOptions, getPackages, getSettings } from '../data'
import { useTranslations } from '../i18n'

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
  
  if (isBudget4Package) {
    // Use budget4 special time options with surcharges
    availableTimeSlots = budget4TimeOptions.map(option => ({
      value: option.value,
      label: `${typeof option.label === 'object' 
        ? (option.label[language] || option.label.th || option.label.en || '')
        : (option.label || '')
      } ${option.time}`,
      surcharge: option.surcharge
    }))
  } else if (selectedPackage?.timeSlots) {
    // Use package-specific time slots
    availableTimeSlots = selectedPackage.timeSlots.split(' / ').map(slot => ({
      value: slot.trim(),
      label: slot.trim(),
      surcharge: 0
    }))
  } else {
    // Use default time options
    availableTimeSlots = timeOptions.map(option => ({
      value: option.value,
      label: `${typeof option.label === 'object' 
        ? (option.label[language] || option.label.th || option.label.en || '')
        : (option.label || '')
      } ${option.time}`,
      surcharge: 0
    }))
  }
  
  // Validation states (after availableTimeSlots is defined)
  const isValidPeople = people > 0
  const isValidPeriod = period && period !== '' && availableTimeSlots.some(slot => slot.value === period)
  const isValidDayType = dayType && dayType !== ''
  
  // Set default period if none is selected or if the current period is not available
  useEffect(() => {
    if (availableTimeSlots.length > 0) {
      const currentPeriodExists = availableTimeSlots.some(slot => slot.value === period)
      if (!period || !currentPeriodExists) {
        setPeriod(availableTimeSlots[0].value)
      }
    }
  }, [availableTimeSlots, period, setPeriod])
  
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

      {/* Guest Count Selector */}
      <div>
        <label className="block text-sm text-stone-600 mb-3">
          {translations.numberOfGuests} (50 - 400) 
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="mb-4">
          <input 
            type="number" 
            value={people} 
            min={1}
            onChange={(e)=>setPeople(parseInt(e.target.value||'0',10))}
            className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 text-lg transition-colors ${
              isValidPeople 
                ? 'border-stone-300 focus:ring-brand-400' 
                : 'border-red-300 focus:ring-red-400 bg-red-50'
            }`}
          />
          {!isValidPeople && (
            <p className="text-red-500 text-sm mt-1">
              {language === 'th' ? 'กรุณาระบุจำนวนแขก' : 'Please enter number of guests'}
            </p>
          )}
        </div>
      </div>

      {/* Time Period Selector */}
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
