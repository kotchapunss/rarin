import React from 'react'
import { Globe } from 'lucide-react'
import { useStore } from '../store'
import { useTranslations } from '../translations'

export default function LanguageToggle() {
  const { language, setLanguage } = useStore()
  const t = useTranslations()
  
  return (
    <div className="relative">
      <button 
        onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition"
        title={t.language}
      >
        <Globe className="w-4 h-4" />
        <span>{language === 'en' ? 'EN' : 'TH'}</span>
      </button>
    </div>
  )
}