
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useTranslations } from '../i18n'

export default function StepNav() {
  const { step, setStep, type, budget, packageId, people, period, dayType, notes, language } = useStore()
  const navigate = useNavigate()
  const t = useTranslations()
  
  // Check if we're in wedding flow (4 steps) or other flows (3 steps)
  const isWeddingFlow = type === 'wedding'
  const maxStep = isWeddingFlow ? 4 : 3
  
  // Check if current step is complete and can proceed to next
  const canProceedToNext = () => {
    if (isWeddingFlow) {
      switch(step) {
        case 0: return type !== null // Type must be selected
        case 1: return budget !== null // Budget must be selected
        case 2: return packageId !== null // Package must be selected
        case 3: return people > 0 && period !== null && period !== '' && dayType !== null && dayType !== '' // All mandatory details must be filled
        case 4: return true // Can always proceed from add-ons step
        default: return false
      }
    } else {
      switch(step) {
        case 0: return type !== null // Type must be selected
        case 1: return packageId !== null // Package must be selected
        case 2: return people > 0 && period !== null && period !== '' && dayType !== null && dayType !== '' // All mandatory details must be filled
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
              (i <= step ? "bg-orange-500" : "bg-stone-300")
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
