
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { getPackages, getSettings, getBudget4TimeOptions, getAddonCategories } from '../data'
import { useTranslations } from '../i18n'

function calcTotal(type, packageId, addons, people, dayType, period, language = 'th') {
  const pkg = getPackages(type).find(p=>p.id===packageId)
  const settings = getSettings()
  const budget4TimeOptions = getBudget4TimeOptions()
  
  // Calculate base price based on package type and day type
  let base = 0
  if (pkg) {
    // Check if package has weekday/weekend specific pricing (for event packages)
    if (pkg.weekdayPrice !== undefined && pkg.weekendPrice !== undefined) {
      base = dayType === 'weekday' ? pkg.weekdayPrice : pkg.weekendPrice
    } else {
      base = pkg.price
    }
  }
  
  // Handle package name - it can be either a string or an object with language keys
  const packageName = pkg ? (
    typeof pkg.name === 'object' 
      ? (pkg.name[language] || pkg.name.th || pkg.name.en || '') 
      : (pkg.name || '')
  ) : ''
  
  // Separate positive addons from negative (discounts)
  // Only consider numeric values (defensive) and sum positives / negatives separately
  const positiveAddons = Object.values(addons).reduce((acc, v) => {
    const n = typeof v === 'number' ? v : Number(v) || 0
    return acc + (n > 0 ? n : 0)
  }, 0)
  const marketingDiscounts = Object.values(addons).reduce((acc, v) => {
    const n = typeof v === 'number' ? v : Number(v) || 0
    return acc + (n < 0 ? n : 0)
  }, 0)
  const addonsSum = positiveAddons + marketingDiscounts
  
  // simple headcount multiplier example (first 50 included)
  const extra = Math.max(0, people - settings.baseGuestLimit) * settings.extraGuestPrice
  
  // Check for budget4 specific time surcharges
  let timeSurcharge = 0
  let timeSurchargeLabel = ''
  
  if (pkg?.budgetId === 'budget4') {
    const selectedTimeOption = budget4TimeOptions.find(option => option.value === period)
    if (selectedTimeOption && selectedTimeOption.surcharge > 0) {
      timeSurcharge = selectedTimeOption.surcharge
      if (selectedTimeOption.value === 'afternoon') {
        timeSurchargeLabel = 'ค่าบริการครึ่งวันบ่าย'
      } else if (selectedTimeOption.value === 'full_day') {
        timeSurchargeLabel = 'ค่าบริการเต็มวัน'
      }
    }
  } else {
    // Add full day surcharge for other packages if period contains "Full Day" or "เต็มวัน"
    timeSurcharge = (period && (period.includes('Full Day') || period.includes('เต็มวัน'))) ? settings.fullDaySurcharge : 0
    if (timeSurcharge > 0) {
      timeSurchargeLabel = 'ค่าบริการเต็มวัน'
    }
  }
  
  // Apply weekday discount
  let weekdayDiscount = 0
  let weekdayDiscountLabel = ''
  
  if (dayType === 'weekday') {
    if (pkg?.budgetId === 'budget4') {
      // Budget4 packages get flat ฿40,000 discount on weekdays
      weekdayDiscount = settings.budget4WeekdayDiscount
      weekdayDiscountLabel = 'ส่วนลดวันธรรมดา (฿40,000)'
    } else if (pkg?.weekdayDiscountEligible === true) {
      // Other eligible packages get ฿20,000 discount
      weekdayDiscount = settings.weekdayDiscount
      weekdayDiscountLabel = 'ส่วนลดวันธรรมดา (฿20,000)'
    }
  }
  
  const isEligibleForDiscount = (pkg?.budgetId === 'budget4') || (pkg?.weekdayDiscountEligible === true)
  
  // Calculate subtotal before discounts
  const subtotalBeforeDiscounts = base + addonsSum + extra + timeSurcharge
  
  // Calculate total discounts
  const totalDiscounts = weekdayDiscount + Math.abs(marketingDiscounts)
  
  // Final subtotal after discounts (before VAT)
  const subtotal = subtotalBeforeDiscounts - totalDiscounts
  
  const vat = Math.round(subtotal * settings.vatRate)
  const total = subtotal + vat
  return { 
    packageName,
    base, 
    addons: positiveAddons, 
    marketingDiscounts: Math.abs(marketingDiscounts), 
    extra, 
    subtotalBeforeDiscounts,
    totalDiscounts,
    subtotal, 
    vat, 
    total, 
    weekdayDiscount, 
    weekdayDiscountLabel, 
    isEligibleForDiscount, 
    timeSurcharge, 
    timeSurchargeLabel 
  }
}

export default function Summary() {
  const state = useStore()
  const navigate = useNavigate()
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = React.useState(true)
  
  const { packageName, base, addons, marketingDiscounts, extra, subtotalBeforeDiscounts, totalDiscounts, subtotal, vat, total, weekdayDiscount, weekdayDiscountLabel, isEligibleForDiscount, timeSurcharge, timeSurchargeLabel } = useMemo(
    ()=>calcTotal(state.type, state.packageId, state.addons, state.people, state.dayType, state.period, state.language),
    [state.type, state.packageId, state.addons, state.people, state.dayType, state.period, state.language]
  )

  // Get selected addon details for display
  const selectedAddons = useMemo(() => {
    const addonsList = []
    
    if (state.type === 'wedding') {
      // Custom services for wedding packages (matching AddonsSelect.jsx)
      const customServices = {
        // Ceremony Services
        engagement_ceremony: { name: { th: "พิธีหมั้น", en: "Engagement Ceremony" } },
        tea_ceremony: { name: { th: "พิธียกน้ำชา", en: "Tea Ceremony" } },
        water_blessing: { name: { th: "พิธีรดน้ำสังข์", en: "Water Blessing Ceremony" } },
        monk_blessing: { name: { th: "พิธีสงฆ์", en: "Monk Blessing Ceremony" } },
        vow_ceremony: { name: { th: "พิธีสาบาน", en: "Vow Ceremony" } },
        
        // Food & Beverage
        classic_thai_buffet: { name: { th: "Classic Thai Buffet", en: "Classic Thai Buffet" } },
        deluxe_international_buffet: { name: { th: "Deluxe International Buffet", en: "Deluxe International Buffet" } },
        delight_cocktail: { name: { th: "Delight Cocktail", en: "Delight Cocktail" } },
        stylish_heavy_cocktail: { name: { th: "Stylish Heavy Cocktail", en: "Stylish Heavy Cocktail" } },
        classic_chinese_table: { name: { th: "Classic Chinese Table", en: "Classic Chinese Table" } },
        deluxe_chinese_table: { name: { th: "Deluxe Chinese Table", en: "Deluxe Chinese Table" } },
        stylish_international_buffet: { name: { th: "Stylish International Buffet", en: "Stylish International Buffet" } },
        western_thai_course_menu: { name: { th: "5 Western / Thai Course Menu", en: "5 Western / Thai Course Menu" } },
        
        // Liquor
        beer_singha: { name: { th: "เบียร์สิงห์", en: "Singha Beer" } },
        beer_asahi: { name: { th: "เบียร์อาซาฮี", en: "Asahi Beer" } },
        wine_house: { name: { th: "ไวน์ House Wine", en: "House Wine" } },
        
        // Marketing Discounts
        collab_program: { name: { th: "โปรแกรม Couple Collab", en: "Couple Collab Program" } },
        social_media_collab: { name: { th: "ร่วมโปรโมททางการตลาดกับลลิล", en: "Co-Marketing" } }
      }
      
      // Iterate known service keys (defensive) and include only non-zero numeric values
      Object.keys(customServices).forEach(addonId => {
        const raw = state.addons?.[addonId]
        const value = typeof raw === 'number' ? raw : (raw ? Number(raw) : 0)
        if (!customServices[addonId]) return
        if (value === 0 || Number.isNaN(value)) return

        // For alcoholic beverages we require positive values to show
        if (['beer_singha', 'beer_asahi', 'wine_house'].includes(addonId) && value <= 0) return

        const service = customServices[addonId]
        // Handle service name - it can be either a string or an object with language keys
        const serviceName = typeof service.name === 'object' 
          ? (service.name[state.language] || service.name.th || service.name.en || '')
          : (service.name || '')
        
        addonsList.push({
          name: serviceName,
          value: value,
          isDiscount: value < 0
        })
      })
    } else {
      // For event and photo types, get addons from config
      const configAddons = getAddonCategories(state.type)
      
      // Flatten all addon items from all categories
      const allConfigAddons = {}
      Object.values(configAddons).forEach(category => {
        if (category.items) {
          category.items.forEach(item => {
            allConfigAddons[item.id] = item
          })
        }
      })
      
      // Process selected addons
      Object.entries(state.addons || {}).forEach(([addonId, storedValue]) => {
        const addon = allConfigAddons[addonId]
        if (!addon) return
        
        const value = typeof storedValue === 'number' ? storedValue : Number(storedValue) || 0
        if (value === 0 || Number.isNaN(value)) return
        
        // Handle addon name - it can be either a string or an object with language keys
        const addonName = typeof addon.name === 'object' 
          ? (addon.name[state.language] || addon.name.th || addon.name.en || '')
          : (addon.name || '')
        
        addonsList.push({
          name: addonName,
          value: value,
          isDiscount: value < 0
        })
      })
    }
    
    return addonsList
  }, [state.addons, state.language, state.type])

  const handleReset = () => {
    // Reset all state and go back to step 1
    state.reset()
    state.setStep(0)
  }

  const handleBookInquiry = () => {
    console.log('Book inquiry clicked!')
    
    // Store the booking data in localStorage for the booking confirmation page
    localStorage.setItem('bookingData', JSON.stringify(state))
    
    try {
      navigate('/booking-confirmation')
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback: use window.location
      window.location.href = '/booking-confirmation'
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-stone-800">{t.summary}</div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-stone-500 hover:text-stone-700 cursor-pointer p-1"
            title={isExpanded ? 'Hide details' : 'Show details'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button 
            onClick={handleReset}
            className="text-sm text-stone-500 hover:text-stone-700 cursor-pointer p-1"
            title={t.reset}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm">
          {/* Base Package */}
          <Row 
            label={state.language === 'th' ? 'แพ็กเกจหลัก' : 'Base Package'} 
            value={base}
          />
          <div className="text-xs text-stone-500 ml-4 -mt-1">
            {packageName}
          </div>
          
          {/* Add-ons Services */}
          {selectedAddons.length > 0 && (
            <>
              <div className="font-medium text-stone-700 mt-4">
                {state.language === 'th' ? 'บริการเสริม' : 'Add-on Services'}
              </div>
              {selectedAddons.filter(addon => !addon.isDiscount).map((addon, index) => (
                <div key={index} className="flex justify-between text-xs ml-4">
                  <span className="text-stone-600">• {addon.name}</span>
                  <span className="text-stone-600">฿{addon.value.toLocaleString()}</span>
                </div>
              ))}
            </>
          )}
          
          {/* Time Surcharge */}
          {timeSurcharge > 0 && (
            <Row 
              label={state.language === 'th' ? timeSurchargeLabel : (timeSurchargeLabel === 'ค่าบริการครึ่งวันบ่าย' ? 'Afternoon Surcharge' : 'Full Day Surcharge')} 
              value={timeSurcharge} 
            />
          )}
          
          <hr className="border-stone-200"/>
          
          {/* Subtotal Before Discounts */}
          <Row 
            label={state.language === 'th' ? 'ยอดรวม (ก่อนส่วนลด)' : 'Subtotal (before discount)'} 
            value={subtotalBeforeDiscounts}
          />
          
          {/* Total Discounts */}
          {totalDiscounts > 0 && (
            <>
              <div className="font-medium text-orange-600 mt-2">
                {state.language === 'th' ? 'ส่วนลดทั้งหมด' : 'Total Discounts'}
              </div>
              
              {/* Marketing Discounts */}
              {selectedAddons.filter(addon => addon.isDiscount).map((addon, index) => (
                <div key={index} className="flex justify-between text-xs ml-4 text-orange-600">
                  <span>• {addon.name}</span>
                  <span>-฿{Math.abs(addon.value).toLocaleString()}</span>
                </div>
              ))}
              
              {/* Weekday Discount */}
              {weekdayDiscount > 0 && (
                <div className="flex justify-between text-xs ml-4 text-orange-600">
                  <span>• {state.language === 'th' ? weekdayDiscountLabel : (weekdayDiscountLabel.includes('฿40,000') ? 'Weekday Discount (฿40,000)' : 'Weekday Discount (฿20,000)')}</span>
                  <span>-฿{weekdayDiscount.toLocaleString()}</span>
                </div>
              )}
              
              <Row 
                label={state.language === 'th' ? 'รวมส่วนลด' : 'Total Discount'} 
                value={-totalDiscounts} 
                className="text-orange-600 font-medium"
              />
            </>
          )}
          
          <hr className="border-stone-200"/>
          
          {/* Subtotal (Before VAT) */}
          <Row 
            label={state.language === 'th' ? 'ยอดรวม (ก่อน VAT)' : 'Subtotal (before VAT)'} 
            value={subtotal}
          />
          
          {/* VAT */}
          <Row 
            label={state.language === 'th' ? 'VAT (7%)' : 'VAT (7%)'} 
            value={vat}
          />
          
          <hr className="border-stone-200"/>
          
          {/* Total with VAT */}
          <Row 
            label={state.language === 'th' ? 'ยอดรวมทั้งสิ้น (รวม VAT)' : 'Total with VAT (7%)'} 
            value={total} 
            bold
          />
        </div>
      )}
      
      {/* Always show total and book button */}
      {!isExpanded && (
        <div className="mt-3 py-2 border-t border-stone-200">
          <Row 
            label={state.language === 'th' ? 'ยอดรวมทั้งสิ้น (รวม VAT)' : 'Total with VAT (7%)'} 
            value={total} 
            bold
          />
        </div>
      )}
      
      <button 
        onClick={handleBookInquiry}
        className="btn btn-primary w-full mt-3"
      >
        {t.bookInquiry}
      </button>
    </div>
  )
}

function Row({label, value, bold, className}){
  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <span className={"text-stone-700 " + (bold ? "font-semibold" : "")}>{label}</span>
      <span className={"tabular-nums " + (bold ? "font-semibold" : "")}>฿{value.toLocaleString()}</span>
    </div>
  )
}
