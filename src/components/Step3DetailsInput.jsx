
import React from 'react'
import { useStore } from '../store'
import { getTimeOptions, getBudget4TimeOptions, getTranslations, getPackages, getSettings } from '../data'

export default function DetailsInput() {
  const { people, period, setPeople, setPeriod, dayType, setDayType, notes, setNotes, language, type, packageId } = useStore()
  const timeOptions = getTimeOptions()
  const budget4TimeOptions = getBudget4TimeOptions()
  const configTranslations = getTranslations(language)
  const settings = getSettings()
  
  // Check if we're in wedding flow to determine correct step titles
  const isWeddingFlow = type === 'wedding'
  const stepTitle = isWeddingFlow ? configTranslations.step4Title : configTranslations.step3Title
  const stepDescription = isWeddingFlow ? configTranslations.step4Description : configTranslations.step3Description
  
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
      label: `${option.label[language] || option.label.th} ${option.time}`,
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
      label: `${option.label[language] || option.label.th} ${option.time}`,
      surcharge: 0
    }))
  }
  
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{stepTitle}</h2>
        <p className="text-gray-600">{stepDescription}</p>
      </div>

      {/* Guest Count Selector */}
      <div>
        <label className="block text-sm text-stone-600 mb-3">{configTranslations.numberOfGuests} (50 - 400)</label>
        <div className="mb-4">
          <input 
            type="number" 
            value={people} 
            min={1}
            onChange={(e)=>setPeople(parseInt(e.target.value||'0',10))}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 text-lg"
          />
        </div>
      </div>

      {/* Time Period Selector */}
      <div>
        <label className="block text-sm text-stone-600 mb-3">{configTranslations.periodTime}</label>
        <div className={`grid gap-3 ${availableTimeSlots.length === 2 ? 'grid-cols-2' : availableTimeSlots.length === 3 ? 'grid-cols-3' : availableTimeSlots.length === 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {availableTimeSlots.map((slot, index) => (
            <button
              key={slot.value}
              onClick={() => setPeriod(slot.value)}
              className={`p-4 rounded-xl border text-center transition ${
                period === slot.value 
                  ? 'border-2 border-orange-600' 
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
      </div>

      {/* Day Type Selector */}
      <div>
        <label className="block text-sm text-stone-600 mb-3">{configTranslations.dayType}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDayType('weekday')}
            className={`p-4 rounded-xl border text-center transition ${
              dayType === 'weekday' 
                ? 'border-2  border-orange-600' 
                : 'bg-white border-stone-300 hover:border-orange-400 hover:bg-orange-50'
            }`}
          >
            <div className="font-medium">{configTranslations.weekday}</div>
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
            <div className="font-medium">{configTranslations.weekend}</div>
          </button>
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm text-stone-600 mb-3">{configTranslations.specialRequests}</label>
        <textarea 
          value={notes} 
          onChange={(e)=>setNotes(e.target.value)}
          rows={4}
          placeholder={configTranslations.placeholder}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:border-2 focus:border-orange-600"
        />
      </div>
    </div>
  )
}
