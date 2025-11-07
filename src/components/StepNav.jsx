
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useTranslations } from '../i18n'
import { getPackages, getBudget4TimeOptions } from '../data'

export default function StepNav() {
  const { step, setStep, type, budget, packageId, people, period, dayType, notes, language } = useStore()
  const navigate = useNavigate()
  const t = useTranslations()
  
  // Check if we're in wedding flow (4 steps) or other flows (3 steps for event, 2 steps for photo)
  const isWeddingFlow = type === 'wedding'
  const isBudget4Wedding = type === 'wedding' && budget === 'budget4'
  const isEventType = type === 'event'
  const isPhotoType = type === 'photo'
  
  // Determine max step based on type
  // Wedding budget4: 0 -> 1 (budget) -> 2 (package) -> 3 (details) -> 4 (addons) = 5 steps
  // Wedding other: 0 -> 1 (budget) -> 2 (package) -> 3 (details) = 4 steps
  // Event: 0 -> 1 (package) -> 2 (details) -> 3 (addons) = 4 steps
  // Photo: 0 -> 1 (package) -> 2 (details) = 3 steps
  const maxStep = isBudget4Wedding ? 4 : (isWeddingFlow ? 3 : (isEventType ? 3 : 2))
  
  // Get the selected package to check if it has time slots
  const selectedPackage = getPackages(type).find(pkg => pkg.id === packageId)
  const isBudget4Package = selectedPackage?.budgetId === 'budget4'
  
  // Check if package has time slots
  const packageHasTimeSlots = () => {
    if (!selectedPackage) return false
    
    if (isBudget4Package) {
      // Budget4 packages always have time slots (special options)
      return true
    }
    
    // Check if timeSlots field exists and is not empty
    return selectedPackage.timeSlots && selectedPackage.timeSlots.trim() !== ''
  }
  
  // Check if current step is complete and can proceed to next
  const canProceedToNext = () => {
    if (isWeddingFlow) {
      switch(step) {
        case 0: return type !== null // Type must be selected
        case 1: return budget !== null // Budget must be selected
        case 2: return packageId !== null // Package must be selected
        case 3: {
          // People and day type are always required
          const basicRequirements = people > 0 && dayType !== null && dayType !== ''
          
          // Period is only required if package has time slots
          if (packageHasTimeSlots()) {
            return basicRequirements && period !== null && period !== ''
          } else {
            return basicRequirements
          }
        }
        case 4: return true // Can always proceed from add-ons step (only for budget4)
        default: return false
      }
    } else {
      switch(step) {
        case 0: return type !== null // Type must be selected
        case 1: return packageId !== null // Package must be selected
        case 2: {
          // For photo type, people count is not required, only day type
          if (type === 'photo') {
            const basicRequirements = dayType !== null && dayType !== ''
            
            // Period is only required if package has time slots
            if (packageHasTimeSlots()) {
              return basicRequirements && period !== null && period !== ''
            } else {
              return basicRequirements
            }
          }
          
          // For event type, people and day type are required
          const basicRequirements = people > 0 && dayType !== null && dayType !== ''
          
          // Period is only required if package has time slots
          if (packageHasTimeSlots()) {
            return basicRequirements && period !== null && period !== ''
          } else {
            return basicRequirements
          }
        }
        case 3: return true // Can always proceed from add-ons step
        default: return false
      }
    }
  }

  const handleNextClick = () => {
    if (step === maxStep) {
      // Last step - navigate to booking confirmation
      const state = useStore.getState()
      localStorage.setItem('bookingData', JSON.stringify(state))
      
      try {
        navigate('/booking-confirmation')
      } catch (error) {
        console.error('Navigation error:', error)
        window.location.href = '/booking-confirmation'
      }
    } else {
      // Regular next step
      setStep(step + 1)
    }
  }
  
  const isLastStep = step === maxStep
  
  // Create step indicators array based on flow type
  const stepCount = maxStep + 1
  const stepIndicators = Array.from({ length: stepCount }, (_, i) => i)
  
  return (
    <div className="flex items-center justify-between">
      <button 
        onClick={() => setStep(step - 1)} 
        className="btn btn-ghost" 
        disabled={step === 0}
      >
        <ChevronLeft className="w-4 h-4 mr-1"/> {t.back || 'Back'}
      </button>
      
      <div className="flex items-center gap-2">
        {stepIndicators.map((i) => (
          <div 
            key={i} 
            className={
              "h-2 rounded-full transition-all " + 
              "w-2 sm:w-8 " + 
              (i <= step ? "bg-[#B8846B]" : "bg-stone-300")
            } 
          />
        ))}
      </div>
      
      <button 
        onClick={handleNextClick} 
        className="btn btn-primary" 
        disabled={!canProceedToNext()}
      >
        {isLastStep ? (t.done || 'Done') : (t.next || 'Next')} 
        <ChevronRight className="w-4 h-4 ml-1"/>
      </button>
    </div>
  )
}
