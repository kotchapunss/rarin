import React from 'react'
import { useStore } from '../store'
import { useTranslations } from '../i18n'

export default function LanguageToggle() {
  const { language, setLanguage } = useStore()
  const t = useTranslations()
  
  return (
    <div className="relative">
      <label className={`toggle-switch ${language}`} title={t.language}>
        <span className="toggle-text en">EN</span>
        <input 
          type="checkbox" 
          checked={language === 'th'} 
          onChange={() => setLanguage(language === 'en' ? 'th' : 'en')} 
        />
        <span className="slider"></span>
        <span className="toggle-text th">TH</span>
      </label>
    </div>
  )
}