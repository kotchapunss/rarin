
import React from 'react'
import { Heart, Calendar, Camera } from 'lucide-react'
import { useStore } from '../store'
import { useTranslations, getEventTypeName, getEventTypeDescription } from '../i18n'
import { getEventTypes } from '../data'

export default function TypeSelector() {
  const { type, setType, step, setStep, language } = useStore()
  const translations = useTranslations()
  const eventTypes = getEventTypes()
  
  const iconMap = {
    Heart,
    Calendar, 
    Camera
  }
  
  return (
    <div className="space-y-6">
      {/* Step 1 Header */}
      <div className="text-left">
        <h2 className="text-xl font-bold text-gray-800 mb-2"   style={{ fontFamily: "'Momo Signature', 'Dancing Script', 'Brush Script MT', cursive" }}>{translations.step1Title}</h2>
        <p className="text-gray-600" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>พร้อมต้อนรับทุกความทรงจำที่สวยงามของคุณ</p>
      </div>
 <p className="text-gray-600">{translations.step1Description}</p>
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
                  <div className="font-semibold text-lg">
                    {getEventTypeName(eventType.id, language)}
                  </div>
                  <div className="text-sm text-stone-500 mt-1">
                    {getEventTypeDescription(eventType.id, language)}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
