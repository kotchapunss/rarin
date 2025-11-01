
import React from 'react'
import { Heart, Calendar, Camera } from 'lucide-react'
import { useStore } from '../store'
import { useTranslations } from '../translations'
import { getEventTypes, getTranslations } from '../data'

export default function TypeSelector() {
  const { type, setType, step, setStep, language } = useStore()
  const t = useTranslations()
  const eventTypes = getEventTypes()
  const configTranslations = getTranslations(language)
  
  const iconMap = {
    Heart,
    Calendar, 
    Camera
  }
  
  return (
    <div className="space-y-6">
      {/* Step 1 Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{configTranslations.step1Title}</h2>
        <p className="text-gray-600">{configTranslations.step1Description}</p>
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-1 gap-4">
        {eventTypes.map(eventType => {
          const Icon = iconMap[eventType.icon]
          const active = type === eventType.id
          return (
            <button key={eventType.id}
              onClick={() => {
                // set the selected type then advance to the next step automatically
                setType(eventType.id)
                setStep(step + 1)
              }}
              className={"card p-6 text-left transition " + (active ? "ring-2 ring-brand-500" : "hover:shadow-md")}>
              <div className="flex items-center gap-4">
                <span className="p-3 rounded-xl bg-brand-100 text-brand-700"><Icon className="w-6 h-6"/></span>
                <div>
                  <div className="font-semibold text-lg">{eventType.name[language] || eventType.name.th}</div>
                  <div className="text-sm text-stone-500 mt-1">{eventType.description[language] || eventType.description.th}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
