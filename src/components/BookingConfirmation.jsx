import React, { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { useTranslations } from '../translations'
import { getPackages, getAddons, getSettings, getBudget4TimeOptions, getAddonCategories } from '../data'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function BookingConfirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTranslations()
  const state = useStore()
  const hiddenInvoiceRef = useRef()
  const [showPDFPreview, setShowPDFPreview] = useState(false)

  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation...')
      const element = hiddenInvoiceRef.current
      
      if (!element) {
        console.error('Hidden PDF element not found')
        alert(t.pdfGenerationError || 'ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง')
        return
      }

      // Make the element visible temporarily for capture
      const originalDisplay = element.style.display
      const originalPosition = element.style.position
      const originalLeft = element.style.left
      const originalTop = element.style.top
      const originalZIndex = element.style.zIndex

      element.style.display = 'block'
      element.style.position = 'fixed'
      element.style.left = '0'
      element.style.top = '0'
      element.style.zIndex = '9999'

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false
      })

      // Restore original styles
      element.style.display = originalDisplay
      element.style.position = originalPosition
      element.style.left = originalLeft
      element.style.top = originalTop
      element.style.zIndex = originalZIndex

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has zero dimensions')
      }

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      if (imgHeight > pdfHeight) {
        const pages = Math.ceil(imgHeight / pdfHeight)
        for (let i = 0; i < pages; i++) {
          if (i > 0) pdf.addPage()
          const yOffset = i * pdfHeight
          pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight)
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      }

      pdf.save(`${t.quotationFilename || 'ใบประเมินราคา'}-${Date.now()}.pdf`)
      console.log('PDF generated successfully')
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(t.pdfGenerationError || 'เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง')
    }
  }

  const calculateTotal = () => {
    // Use the same calculation rules as Summary.calcTotal to ensure consistent totals
    const selectedPackage = getPackages(state.type).find(p => p.id === state.packageId)
    const settings = getSettings()
    const budget4TimeOptions = getBudget4TimeOptions()
    
    // Calculate base price based on package type and day type
    let basePrice = 0
    if (selectedPackage) {
      // Check if package has weekday/weekend specific pricing (for event packages)
      if (selectedPackage.weekdayPrice !== undefined && selectedPackage.weekendPrice !== undefined) {
        basePrice = state.dayType === 'weekday' ? selectedPackage.weekdayPrice : selectedPackage.weekendPrice
      } else {
        basePrice = selectedPackage.price
      }
    }

    // Separate positive addons from negative (discounts)
    const positiveAddons = Object.values(state.addons || {}).reduce((acc, v) => {
      const n = typeof v === 'number' ? v : Number(v) || 0
      return acc + (n > 0 ? n : 0)
    }, 0)

    const marketingDiscounts = Object.values(state.addons || {}).reduce((acc, v) => {
      const n = typeof v === 'number' ? v : Number(v) || 0
      return acc + (n < 0 ? n : 0)
    }, 0)

    const addonsSum = positiveAddons + marketingDiscounts

    // extra guest charges
    const extraGuestsCost = Math.max(0, state.people - settings.baseGuestLimit) * settings.extraGuestPrice

    // Time surcharge logic
    let timeSurcharge = 0
    let timeSurchargeLabel = ''

    if (selectedPackage?.budgetId === 'budget4') {
      const selectedTimeOption = budget4TimeOptions.find(option => option.value === state.period)
      if (selectedTimeOption && selectedTimeOption.surcharge > 0) {
        timeSurcharge = selectedTimeOption.surcharge
        if (selectedTimeOption.value === 'afternoon') {
          timeSurchargeLabel = 'ค่าบริการครึ่งวันบ่าย'
        } else if (selectedTimeOption.value === 'full_day') {
          timeSurchargeLabel = 'ค่าบริการเต็มวัน'
        }
      }
    } else {
      timeSurcharge = (state.period && (state.period.includes('Full Day') || state.period.includes('เต็มวัน'))) ? settings.fullDaySurcharge : 0
      if (timeSurcharge > 0) timeSurchargeLabel = 'ค่าบริการเต็มวัน'
    }

    // Subtotal before discounts
    const subtotalBeforeDiscounts = basePrice + addonsSum + extraGuestsCost + timeSurcharge

    // Weekday discounts
    let weekdayDiscount = 0
    let weekdayDiscountLabel = ''
    if (state.dayType === 'weekday') {
      if (selectedPackage?.budgetId === 'budget4') {
        weekdayDiscount = settings.budget4WeekdayDiscount
        weekdayDiscountLabel = 'ส่วนลดวันธรรมดา (฿40,000)'
      } else if (selectedPackage?.weekdayDiscountEligible === true) {
        weekdayDiscount = settings.weekdayDiscount
        weekdayDiscountLabel = 'ส่วนลดวันธรรมดา (฿20,000)'
      }
    }

    const totalDiscounts = weekdayDiscount + Math.abs(marketingDiscounts)

    const subtotal = subtotalBeforeDiscounts - totalDiscounts

    const vat = Math.round(subtotal * settings.vatRate)
    const total = subtotal + vat

    return {
      basePrice,
      addonsTotal: positiveAddons, // positive addon sum (for display if needed)
      extraGuestsCost,
      subtotal,
      vat,
      total,
      weekdayDiscount,
      weekdayDiscountLabel,
      isEligibleForDiscount: (selectedPackage?.budgetId === 'budget4') || (selectedPackage?.weekdayDiscountEligible === true),
      selectedPackage,
      timeSurcharge,
      timeSurchargeLabel,
      subtotalBeforeDiscounts,
      marketingDiscounts
    }
  }

  const { basePrice, addonsTotal, extraGuestsCost, subtotal, vat, total, weekdayDiscount, weekdayDiscountLabel, isEligibleForDiscount, selectedPackage, timeSurcharge, timeSurchargeLabel, marketingDiscounts, subtotalBeforeDiscounts } = calculateTotal()

  // Get selected addons details
  const getSelectedAddons = () => {
    const selectedAddons = []

    if (state.type === 'wedding') {
      // For wedding type, use the same hardcoded services as Summary
      const customServices = {
        engagement_ceremony: { name: { th: "พิธีหมั้น", en: "Engagement Ceremony" }, price: 15000, type: "checkbox" },
        tea_ceremony: { name: { th: "พิธียกน้ำชา", en: "Tea Ceremony" }, price: 35000, type: "checkbox" },
        water_blessing: { name: { th: "พิธีรดน้ำสังข์", en: "Water Blessing Ceremony" }, price: 35000, type: "checkbox" },
        monk_blessing: { name: { th: "พิธีสงฆ์", en: "Monk Blessing Ceremony" }, price: 35000, type: "checkbox" },
        vow_ceremony: { name: { th: "พิธีสาบาน", en: "Vow Ceremony" }, price: 35000, type: "checkbox" },
        classic_thai_buffet: { name: { th: "Classic Thai Buffet", en: "Classic Thai Buffet" }, price: 950, type: "auto", unit: "ท่าน" },
        deluxe_international_buffet: { name: { th: "Deluxe International Buffet", en: "Deluxe International Buffet" }, price: 1290, type: "auto", unit: "ท่าน" },
        delight_cocktail: { name: { th: "Delight Cocktail", en: "Delight Cocktail" }, price: 950, type: "auto", unit: "ท่าน" },
        stylish_heavy_cocktail: { name: { th: "Stylish Heavy Cocktail", en: "Stylish Heavy Cocktail" }, price: 1590, type: "auto", unit: "ท่าน" },
        classic_chinese_table: { name: { th: "Classic Chinese Table", en: "Classic Chinese Table" }, price: 9900, type: "auto", unit: "10 ท่าน" },
        deluxe_chinese_table: { name: { th: "Deluxe Chinese Table", en: "Deluxe Chinese Table" }, price: 13900, type: "auto", unit: "10 ท่าน" },
        stylish_international_buffet: { name: { th: "Stylish International Buffet", en: "Stylish International Buffet" }, price: 1590, type: "auto", unit: "ท่าน" },
        western_thai_course_menu: { name: { th: "5 Western / Thai Course Menu", en: "5 Western / Thai Course Menu" }, price: 1800, type: "auto", unit: "10 ท่าน" },
        beer_singha: { name: { th: "เบียร์สิงห์", en: "Singha Beer" }, price: 120, type: "input", unit: "ขวด" },
        beer_asahi: { name: { th: "เบียร์อาซาฮี", en: "Asahi Beer" }, price: 150, type: "input", unit: "ขวด" },
        wine_house: { name: { th: "ไวน์ House Wine", en: "House Wine" }, price: 800, type: "input", unit: "ขวด" },
        collab_program: { name: { th: "โปรแกรม Couple Collab", en: "Couple Collab Program" }, discount: 20000, type: "discount" },
        social_media_collab: { name: { th: "ร่วมโปรโมททางการตลาดกับลลิล", en: "Co-Marketing" }, discount: 10000, type: "discount" }
      }

      Object.entries(state.addons || {}).forEach(([addonId, storedValue]) => {
        const addon = customServices[addonId]
        if (!addon) return

        const value = typeof storedValue === 'number' ? storedValue : Number(storedValue) || 0
        if (value === 0 || Number.isNaN(value)) return

        let quantity = 1
        let unitPrice = addon.price || Math.abs(addon.discount || 0)
        let totalPrice = value

        if (addon.type === 'auto') {
          quantity = state.people || 1
          if (addon.unit === '10 ท่าน') {
            quantity = Math.ceil((state.people || 1) / 10)
          }
        } else if (addon.type === 'input') {
          if (unitPrice > 0) {
            quantity = Math.max(1, Math.round(Math.abs(value) / unitPrice))
          }
        }

        selectedAddons.push({
          id: addonId,
          name: addon.name[state.language] || addon.name.th,
          type: addon.type,
          unit: addon.unit || '',
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        })
      })
    } else {
      // For event and photo types, get from config
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

      Object.entries(state.addons || {}).forEach(([addonId, storedValue]) => {
        const addon = allConfigAddons[addonId]
        if (!addon) return

        const value = typeof storedValue === 'number' ? storedValue : Number(storedValue) || 0
        if (value === 0 || Number.isNaN(value)) return

        let quantity = 1
        let unitPrice = addon.price || 0
        let totalPrice = value

        if (addon.type === 'grid') {
          quantity = state.people || 1
          if (addon.unit === 'โต๊ะ') {
            quantity = Math.ceil((state.people || 1) / 10)
          }
        } else if (addon.type === 'input') {
          if (unitPrice > 0) {
            quantity = Math.max(1, Math.round(Math.abs(value) / unitPrice))
          }
        }

        selectedAddons.push({
          id: addonId,
          name: addon.name[state.language] || addon.name.th,
          type: addon.type,
          unit: addon.unit || '',
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        })
      })
    }

    return selectedAddons
  }

  const selectedAddons = getSelectedAddons()

  // Prepare addon groups for display: positive addons and marketing discounts
  const positiveSelectedAddons = selectedAddons.filter(a => a.totalPrice > 0)
  const negativeSelectedAddons = selectedAddons.filter(a => a.totalPrice < 0)
  const marketingDiscountsAbs = Math.abs(marketingDiscounts || 0)
  const totalDiscounts = (weekdayDiscount || 0) + marketingDiscountsAbs

  // Don't show PDF preview, show the main summary
  if (showPDFPreview) {
    return (
      <div className="min-h-screen bg-gray-900 bg-opacity-50">
        {/* PDF Preview Modal */}
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-800">
                {t.quotationPreview || 'ใบประเมินราคา (ตัวอย่าง)'}
              </h1>
              <button
                onClick={() => setShowPDFPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* PDF Content - Scrollable */}
            <div className="overflow-y-auto max-h-[80vh] p-6">
              <div className="bg-white">
                {/* Header Section */}
                <div className="bg-[#B8846B] text-white p-4 rounded-t-lg mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        {t.quotationPreview || 'ใบประเมินราคาเบื้องต้น'}
                      </h2>
                      <p className="text-sm opacity-90">Estimated Cost Summary</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'cursive' }}>
                        Varavela
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Tel:</strong> ({state.details?.tel || 'ยังไม่ระบุ'})</div>
                      <div><strong>Email:</strong> ({state.details?.email || 'ยังไม่ระบุ'})</div>
                      <div><strong>Line ID:</strong> ({state.details?.lineId || 'ยังไม่ระบุ'})</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm space-y-1">
                      <div>เลขที่: VARAVELA-20251029-2349</div>
                      <div>วันที่: 29/10/2568</div>
                      <div className="text-[#B8846B] font-semibold">ร่าง</div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">ผู้ติดต่อ:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    จำนวนแขก: {state.people} ท่าน | ช่วงเวลา: {
                      state.period === 'morning' ? 'ช่วงเช้า' : 
                      state.period === 'afternoon' ? 'บ่ายเวลา' : 'เต็มวัน'
                    } | ประเภทวัน: {
                      state.dayType === 'weekday' ? 'วันธรรมดา' : 'วันหยุดสุดสัปดาห์'
                    } | ประเภท: {
                      state.type === 'wedding' ? 'งานแต่งงาน' :
                      state.type === 'event' ? 'งานอีเวนต์' : 'ถ่ายภาพ'
                    }
                  </div>
                    {state.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>ความต้องการพิเศษ:</strong> {state.notes}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>เบอร์โทร: 02666626</div>
                      <div>อีเมล: hello@varavela.com</div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left text-sm font-semibold">รหัส</th>
                        <th className="border border-gray-300 p-3 text-left text-sm font-semibold">รายการสินค้า</th>
                        <th className="border border-gray-300 p-3 text-center text-sm font-semibold">จำนวน</th>
                        <th className="border border-gray-300 p-3 text-right text-sm font-semibold">ราคา/หน่วย</th>
                        <th className="border border-gray-300 p-3 text-right text-sm font-semibold">รวมเป็นเงิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3 text-sm">001</td>
                        <td className="border border-gray-300 p-3 text-sm">{selectedPackage?.name || 'ไม่ได้เลือกแพ็กเกจ'}</td>
                        <td className="border border-gray-300 p-3 text-center text-sm">1</td>
                        <td className="border border-gray-300 p-3 text-right text-sm">{basePrice.toLocaleString()}</td>
                        <td className="border border-gray-300 p-3 text-right text-sm">{basePrice.toLocaleString()}</td>
                      </tr>
                      {selectedAddons.map((addon, index) => (
                        <tr key={addon.id}>
                          <td className="border border-gray-300 p-3 text-sm">{String(index + 2).padStart(3, '0')}</td>
                          <td className="border border-gray-300 p-3 text-sm">{addon.name}</td>
                          <td className="border border-gray-300 p-3 text-center text-sm">{addon.quantity}</td>
                          <td className="border border-gray-300 p-3 text-right text-sm">{(addon.totalPrice < 0 ? addon.totalPrice : addon.unitPrice).toLocaleString()}</td>
                          <td className="border border-gray-300 p-3 text-right text-sm">{addon.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                      {timeSurcharge > 0 && (
                        <tr>
                          <td className="border border-gray-300 p-3 text-sm">{String(selectedAddons.length + 2).padStart(3, '0')}</td>
                          <td className="border border-gray-300 p-3 text-sm">{timeSurchargeLabel}</td>
                          <td className="border border-gray-300 p-3 text-center text-sm">1</td>
                          <td className="border border-gray-300 p-3 text-right text-sm">{timeSurcharge.toLocaleString()}</td>
                          <td className="border border-gray-300 p-3 text-right text-sm">{timeSurcharge.toLocaleString()}</td>
                        </tr>
                      )}
                      {extraGuestsCost > 0 && (
                        <tr>
                          <td className="border border-gray-300 p-3 text-sm">{String(selectedAddons.length + (timeSurcharge > 0 ? 3 : 2)).padStart(3, '0')}</td>
                          <td className="border border-gray-300 p-3 text-sm">แขกเพิ่มเติม ({state.people - 50} ท่าน)</td>
                          <td className="border border-gray-300 p-3 text-center text-sm">{state.people - 50}</td>
                          <td className="border border-gray-300 p-3 text-right text-sm">150</td>
                          <td className="border border-gray-300 p-3 text-right text-sm">{extraGuestsCost.toLocaleString()}</td>
                        </tr>
                      )}
                      {weekdayDiscount > 0 && (
                        <tr>
                          <td className="border border-gray-300 p-3 text-sm">{String(selectedAddons.length + (extraGuestsCost > 0 ? 1 : 0) + (timeSurcharge > 0 ? 1 : 0) + 2).padStart(3, '0')}</td>
                          <td className="border border-gray-300 p-3 text-sm text-orange-600">{weekdayDiscountLabel}</td>
                          <td className="border border-gray-300 p-3 text-center text-sm">1</td>
                          <td className="border border-gray-300 p-3 text-right text-sm text-orange-600">-{(weekdayDiscount).toLocaleString()}</td>
                          <td className="border border-gray-300 p-3 text-right text-sm text-orange-600">-{weekdayDiscount.toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Notes and Totals Section */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Notes */}
                  <div>
                    <h4 className="font-semibold mb-3">หมายเหตุ:</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>ราคานี้เป็นราคาประเมินเบื้องต้น และอาจมีการเปลี่ยนแปลง</p>
                      <p>และอาจมีการเปลี่ยนแปลงขอมูลแนบ</p>
                    </div>
                  </div>

                  {/* Totals */}
                  <div>
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between text-sm">
                        <span>ราคารวมก่อนบวก</span>
                        <span className="font-semibold">฿{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ภาษีมูลค่าเพิ่ม 7%</span>
                        <span className="font-semibold">฿{vat.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>ราคารวมสุทธิ</span>
                          <span className="text-[#B8846B]">฿{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-xs text-gray-500 text-center">
                  ห้องราคาสำหรับการให้บริการที่ดีรองรับเล่น Chrome, หรือ Safari
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowPDFPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                {t.close || 'ยกเลิก'}
              </button>
              <button
                onClick={generatePDF}
                className="bg-[#B8846B] text-white px-6 py-2 rounded-lg hover:bg-[#A0735A] transition-colors flex items-center space-x-2 font-medium"
              >
                <span>📄</span>
                <span>{t.downloadPdf || 'ดาวน์โหลด PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hidden PDF Template - Updated to match preview */}
        <div 
          ref={hiddenInvoiceRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            display: 'none',
            width: '794px',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.4',
            color: '#000000'
          }}
        >
          <div style={{ padding: '40px', width: '794px', minHeight: '1123px' }}>
            {/* PDF Header */}
            <div style={{ backgroundColor: '#B8846B', color: 'white', padding: '20px', borderRadius: '8px 8px 0 0', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', margin: '0 0 5px 0' }}>
                    ใบประเมินราคาเบื้องต้น
                  </h2>
                  <p style={{ fontSize: '14px', opacity: '0.9', margin: '0' }}>Estimated Cost Summary</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'cursive' }}>
                    Varavela
                  </div>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
              <div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '15px', margin: '0 0 15px 0' }}>Contact Information</h3>
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                  <div><strong>Tel:</strong> ({state.details?.tel || 'ยังไม่ระบุ'})</div>
                  <div><strong>Email:</strong> ({state.details?.email || 'ยังไม่ระบุ'})</div>
                  <div><strong>Line ID:</strong> ({state.details?.lineId || 'ยังไม่ระบุ'})</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  <div>เลขที่: VARAVELA-20251029-2349</div>
                  <div>วันที่: 29/10/2568</div>
                  <div style={{ color: '#B8846B', fontWeight: 'bold' }}>ร่าง</div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '15px', margin: '0 0 15px 0' }}>ผู้ติดต่อ:</h3>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '10px' }}>
                  จำนวนแขก: {state.people} ท่าน | ช่วงเวลา: {
                    state.period === 'morning' ? 'ช่วงเช้า' : 
                    state.period === 'afternoon' ? 'บ่ายเวลา' : 'เต็มวัน'
                  } | ประเภทวัน: {
                    state.dayType === 'weekday' ? 'วันธรรมดา' : 'วันหยุดสุดสัปดาห์'
                  } | ประเภท: {
                    state.type === 'wedding' ? 'งานแต่งงาน' :
                    state.type === 'event' ? 'งานอีเวนต์' : 'ถ่ายภาพ'
                  }
                </div>
                {state.notes && (
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                    <strong>ความต้องการพิเศษ:</strong> {state.notes}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12px' }}>
                  <div>เบอร์โทร: 02666626</div>
                  <div>อีเมล: hello@varavela.com</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>รหัส</th>
                  <th style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>รายการสินค้า</th>
                  <th style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>จำนวน</th>
                  <th style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>ราคา/หน่วย</th>
                  <th style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>รวมเป็นเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>001</td>
                  <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>{selectedPackage?.name || 'ไม่ได้เลือกแพ็กเกจ'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'center', fontSize: '12px' }}>1</td>
                  <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>{basePrice.toLocaleString()}</td>
                  <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>{basePrice.toLocaleString()}</td>
                </tr>
                {selectedAddons.map((addon, index) => (
                  <tr key={addon.id}>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>{String(index + 2).padStart(3, '0')}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>{addon.name}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'center', fontSize: '12px' }}>{addon.quantity}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>{(addon.totalPrice < 0 ? addon.totalPrice : addon.unitPrice).toLocaleString()}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>{addon.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
                {timeSurcharge > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>{String(selectedAddons.length + 2).padStart(3, '0')}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>{timeSurchargeLabel}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'center', fontSize: '12px' }}>1</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>{timeSurcharge.toLocaleString()}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>{timeSurcharge.toLocaleString()}</td>
                  </tr>
                )}
                {extraGuestsCost > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>{String(selectedAddons.length + (timeSurcharge > 0 ? 3 : 2)).padStart(3, '0')}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>แขกเพิ่มเติม ({state.people - 50} ท่าน)</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'center', fontSize: '12px' }}>{state.people - 50}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>150</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px' }}>{extraGuestsCost.toLocaleString()}</td>
                  </tr>
                )}
                {weekdayDiscount > 0 && (
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px' }}>{String(selectedAddons.length + (extraGuestsCost > 0 ? 1 : 0) + (timeSurcharge > 0 ? 1 : 0) + 2).padStart(3, '0')}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', fontSize: '12px', color: '#16a34a' }}>{weekdayDiscountLabel}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'center', fontSize: '12px' }}>1</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px', color: '#16a34a' }}>-{weekdayDiscount.toLocaleString()}</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px', textAlign: 'right', fontSize: '12px', color: '#16a34a' }}>-{weekdayDiscount.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Notes and Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              {/* Notes */}
              <div>
                <h4 style={{ fontWeight: 'bold', marginBottom: '15px', margin: '0 0 15px 0' }}>หมายเหตุ:</h4>
                <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 5px 0' }}>ราคานี้เป็นราคาประเมินเบื้องต้น และอาจมีการเปลี่ยนแปลง</p>
                  <p style={{ margin: '0' }}>และอาจมีการเปลี่ยนแปลงขอมูลแนบ</p>
                </div>
              </div>

              {/* Totals */}
              <div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span>ราคารวมก่อนบวก</span>
                    <span style={{ fontWeight: 'bold' }}>฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                    <span>ภาษีมูลค่าเพิ่ม 7%</span>
                    <span style={{ fontWeight: 'bold' }}>฿{vat.toLocaleString()}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                      <span>ราคารวมสุทธิ</span>
                      <span style={{ color: '#B8846B' }}>฿{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '40px', fontSize: '10px', color: '#666', textAlign: 'center' }}>
              ห้องราคาสำหรับการให้บริการที่ดีรองรับเล่น Chrome, หรือ Safari
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main booking confirmation page
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Card */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200">
            {/* Varavela Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[#B8846B] text-4xl font-bold" style={{ fontFamily: 'cursive' }}>
                Varavela
              </div>
            </div>
          </div>

          {/* Contact Info Strip */}
          <div className="border-b border-gray-200 p-4">
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
              <div className="flex items-center justify-center">
                <span>📞 TEL 02-946-5625</span>
              </div>
              <div className="flex items-center justify-center">
                <span>📧 hello@varavela.com</span>
              </div>
              <div className="flex items-center justify-center">
                <span>💬 Line Official: @varavela</span>
              </div>
              <div className="flex items-center justify-center text-center">
                <span>🕒 Office Time 10:00-19:00<br />Monday - Sunday</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {t.estimationSummary || 'สรุปการคำนวณ'}
              </h1>
              <p className="text-gray-600">
                {t.estimationDescription || 'สรุปราคาสำหรับการใช้งานเดีย'}
              </p>
            </div>

            {/* Package Summary */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">
                {t.serviceSummary || 'สรุปราคาการ'}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>{t.packageType || 'ค่าแพ็กเกจ'} ({selectedPackage?.name || 'ไม่ได้เลือกแพ็กเกจ'})</span>
                  <span className="font-semibold">฿{basePrice.toLocaleString()}</span>
                </div>
                {positiveSelectedAddons.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <div className="text-sm text-gray-600 mb-2">บริการเสริม:</div>
                    {positiveSelectedAddons.map((addon, index) => (
                      <div key={addon.id} className="flex justify-between items-center text-sm mb-1">
                        <span>• {addon.name}{addon.quantity > 1 ? ` × ${addon.quantity}` : ''}</span>
                        <span>฿{addon.totalPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Discounts Section (marketing discounts + weekday discount) */}
                {(negativeSelectedAddons.length > 0 || weekdayDiscount > 0) && (
                  <div className="mt-3 border-t pt-3">
                    <div className="font-medium text-orange-600 mt-2">{state.language === 'th' ? 'ส่วนลดทั้งหมด' : 'Total Discounts'}</div>
                    {negativeSelectedAddons.map((addon, index) => (
                      <div key={addon.id} className="flex justify-between text-sm ml-4 text-orange-600">
                        <span>• {addon.name}</span>
                        <span>-฿{Math.abs(addon.totalPrice).toLocaleString()}</span>
                      </div>
                    ))}

                    {weekdayDiscount > 0 && (
                      <div className="flex justify-between text-sm ml-4 text-orange-600">
                        <span>• {weekdayDiscountLabel}</span>
                        <span>-฿{weekdayDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-orange-600 font-medium ml-4">
                        <span>{state.language === 'th' ? 'รวมส่วนลด' : 'Total Discount'}</span>
                        <span>-฿{totalDiscounts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                {timeSurcharge > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>{timeSurchargeLabel}</span>
                      <span>฿{timeSurcharge.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {extraGuestsCost > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>แขกเพิ่มเติม ({state.people - 50} ท่าน)</span>
                      <span>฿{extraGuestsCost.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {weekdayDiscount > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <div className="flex justify-between items-center text-sm text-orange-600">
                      <span>{weekdayDiscountLabel}</span>
                      <span>-฿{weekdayDiscount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-300 pt-6 mb-8">
              <div className="flex justify-between text-lg mb-2">
                <span>{t.beforeVat || 'ราคาก่อน VAT'}</span>
                <span className="font-semibold">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#B8846B] mb-4">
                <span>{t.totalWithVat || 'ราคารวม VAT (7%)'}</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">
                {t.priceDisclaimer || '* ราคานี้เป็นการประเมินเบื้องต้นที่อาจมีการเปลี่ยนแปลง เมื่อดำเนินการตามระบบนี้จริงขึ้นอยู่'}
              </p>
            </div>

            {/* Main Action Button */}
            <button className="w-full bg-[#B8846B] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#A0735A] transition-colors mb-4">
              {t.submitRequest || 'ส่งยื่น'}
            </button>

            {/* Bottom Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors"
              >
                {t.backToEdit || 'กลับไปแก้ไข'}
              </button>
              <button className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors">
                {t.lineOA || 'Line OA'}
              </button>
              <button 
                onClick={() => setShowPDFPreview(true)}
                className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors"
              >
                {t.quotation || 'ใบประเมินราคา'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}