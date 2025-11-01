
import React, { useState } from 'react'
import { getTranslations, getAddons, getAddonCategories } from '../data'
import { useStore } from '../store'

export default function AddonsSelect() {
  const { addons, toggleAddon, language, people, type } = useStore()
  const configTranslations = getTranslations(language)
  const [quantities, setQuantities] = useState({})
  const [expandedCeremony, setExpandedCeremony] = useState(null)
  const [activeTab, setActiveTab] = useState('')

  // Get addons from config for non-wedding events
  const configAddons = getAddonCategories(type)

  // Set default active tab when configAddons changes or for wedding
  React.useEffect(() => {
    if (type === 'wedding' && !activeTab) {
      setActiveTab('ceremony')
    } else if (configAddons && Object.keys(configAddons).length > 0 && !activeTab) {
      setActiveTab(Object.keys(configAddons)[0])
    }
  }, [configAddons, activeTab, type])

  // Custom services for Budget4 wedding packages
  const customServices = {
    ceremony: {
      title: {
        th: "งานพิธี",
        en: "Ceremony Services"
      },
      items: [
        {
          id: "engagement_ceremony",
          name: {
            th: "พิธีหมั้น",
            en: "Engagement Ceremony"
          },
          shortName: {
            th: "ENGAGEMENT CEREMONY",
            en: "ENGAGEMENT CEREMONY"
          },
          description: "พิธีหมั้นแบบไทยครบชุด",
          minGuests: 20,
          price: 15000,
          type: "checkbox",
          details: [
            "Traditional Thai engagement ceremony setup",
            "Khan Maak (traditional offering trays)",
            "Ceremonial equipment and decorations",
            "Traditional Thai costumes for couple (rental)",
            "Makeup artist and hair stylist",
            "Ceremony photographer",
            "Master of ceremony",
            "Traditional Thai music accompaniment",
            "Thai sweets and fruits for guests"
          ]
        },
        {
          id: "water_blessing",
          name: {
            th: "พิธีรดน้ำสังข์",
            en: "Water Blessing Ceremony"
          },
          shortName: {
            th: "WATER BLESSING",
            en: "WATER BLESSING"
          },
          description: "พิธีรดน้ำสังข์",
          minGuests: 50,
          price: 35000,
          type: "checkbox",
          details: [
            "Ring exchange ceremony setup",
            "Buddha Altar Set for blessings",
            "Blessing Ceremony Set with holy powder",
            "Twin blessing cords for ceremony",
            "Bride & Groom Floral Garlands (1 Pair)",
            "80 Chairs for guests",
            "Ceremonial ring tray",
            "Holy water and ceremonial vessels",
            "Flower petals and rose decorations",
            "Thai fabric for guest seating area"
          ]
        },
        {
          id: "monk_blessing",
          name: {
            th: "พิธีสงฆ์",
            en: "Monk Blessing Ceremony"
          },
          shortName: {
            th: "MONK BLESSING",
            en: "MONK BLESSING"
          },
          description: "พิธีสงฆ์",
          minGuests: 30,
          price: 35000,
          type: "checkbox",
          details: [
            "Buddha Altar Set for ceremonial offering",
            "Monk Ceremony Stage & Equipment setup",
            "Monk seating mats and cushions",
            "Traditional offering sets for monks",
            "Holy water bowl and sacred thread",
            "Invitation of 9 Monks with coordination",
            "Round-trip transportation service for monks",
            "Monk meal and refreshments",
            "Candles and flowers for worship",
            "Thai fabric for Dharma listening area"
          ]
        },
        {
          id: "tea_ceremony",
          name: {
            th: "พิธียกน้ำชา",
            en: "Tea Ceremony"
          },
          shortName: {
            th: "CHINESE TEA",
            en: "CHINESE TEA"
          },
          description: "พิธียกน้ำชาแบบจีน",
          minGuests: 30,
          price: 35000,
          type: "checkbox",
          details: [
            "Ring exchange ceremony setup",
            "Chinese tea service for 50 guests",
            "Premium ceremony tea services",
            "Elegant sofa set for couple",
            "50 chairs for guest seating",
            "Traditional Chinese tea sets",
            "Tea accompaniments and sweets",
            "Ceremonial tea preparation",
            "Tea ceremony coordination",
            "Photography for key moments"
          ]
        },
        {
          id: "vow_ceremony",
          name: {
            th: "พิธีสาบาน",
            en: "Vow Ceremony"
          },
          shortName: {
            th: "VOW",
            en: "VOW"
          },
          description: "พิธีสาบานตน",
          minGuests: 40,
          price: 35000,
          type: "checkbox",
          details: [
            "Elegant ceremony stage setup",
            "Multiple petal stations for decoration",
            "80 chairs arranged for optimal viewing",
            "Ceremonial ring tray with decoration",
            "Microphone and sound system",
            "Floral arrangements and decorations",
            "Aisle runner and petals",
            "Ceremony coordination",
            "Photography for vow exchange",
            "Background music arrangement"
          ]
        }
      ]
    },
    food: {
      title: {
        th: "อาหารและเครื่องดื่ม",
        en: "Food & Beverage"
      },
      items: [
        {
          id: "classic_thai_buffet",
          name: {
            th: "Classic Thai Buffet",
            en: "Classic Thai Buffet"
          },
          description: "10 รายการ (อาหาร 7 อย่าง,ของหวาน 2 ที่,ข้าวและ เครื่องดื่ม 3 รายการ)",
          minGuests: 30,
          price: 950,
          type: "auto",
          unit: "ท่าน"
        },
        {
          id: "deluxe_international_buffet",
          name: {
            th: "Deluxe International Buffet",
            en: "Deluxe International Buffet"
          },
          description: "9 รายการ (อาหาร 7 อย่าง,ของหวาน 2 เครื่องดื่ม 3 รายการ)",
          minGuests: 40,
          price: 1290,
          type: "auto",
          unit: "ท่าน"
        },
        {
          id: "delight_cocktail",
          name: {
            th: "Delight Cocktail",
            en: "Delight Cocktail"
          },
          description: "10 รายการ (คาบาป 10 รายการ และ เครื่องดื่ม 3 รายการ) ดื่มฟรีอาหาร 3 ชุ่มอ่น",
          price: 950,
          type: "auto",
          unit: "ท่าน"
        },
        {
          id: "stylish_heavy_cocktail",
          name: {
            th: "Stylish Heavy Cocktail",
            en: "Stylish Heavy Cocktail"
          },
          description: "14 รายการ (คาบาป 8 อย่าง,ของหวาน 2 ขนามคาบ 4 รายการ ,เครื่องดื่ม 4 รายการ)",
          price: 1590,
          type: "auto",
          unit: "ท่าน"
        },
        {
          id: "classic_chinese_table",
          name: {
            th: "Classic Chinese Table",
            en: "Classic Chinese Table"
          },
          description: "9 รายการ (อาหาร 8 อย่าง,ของหวาน 1 และ เครื่องดื่ม 2 รายการ) เปียดโต๊ะ 10 ท่าน",
          price: 9900,
          type: "auto",
          unit: "10 ท่าน"
        },
        {
          id: "deluxe_chinese_table",
          name: {
            th: "Deluxe Chinese Table",
            en: "Deluxe Chinese Table"
          },
          description: "9 รายการ (อาหาร 8 อย่าง,ของหวาน 1 และ เครื่องดื่ม 2 รายการ) เปียดโต๊ะ 10 ท่าน",
          price: 13900,
          type: "auto",
          unit: "10 ท่าน"
        },
        {
          id: "stylish_international_buffet",
          name: {
            th: "Stylish International Buffet",
            en: "Stylish International Buffet"
          },
          description: "9 รายการ (อาหาร 8 อย่าง,ของหวาน 1 และ เครื่องดื่ม 2 รายการ) เปียดโต๊ะ 10 ท่าน",
          minGuests: 50,
          price: 1590,
          type: "auto",
          unit: "ท่าน"
        },
        {
          id: "western_thai_course_menu",
          name: {
            th: "5 Western / Thai Course Menu",
            en: "5 Western / Thai Course Menu"
          },
          description: "5 รายการ (Appetizer / Salad / Soup / Main Course / Dessert )",
          price: 1800,
          type: "auto",
          unit: "10 ท่าน"
        }
      ]
    },
    liquor: {
      title: {
        th: "เครื่องดื่มแอลกอฮอล์",
        en: "Alcoholic Beverages"
      },
      items: [
        {
          id: "beer_singha",
          name: {
            th: "เบียร์สิงห์",
            en: "Singha Beer"
          },
          description: "เบียร์สิงห์ ขวดใหญ่ 630ml",
          price: 120,
          type: "input",
          unit: "ขวด"
        },
        {
          id: "beer_asahi",
          name: {
            th: "เบียร์อาซาฮี",
            en: "Asahi Beer"
          },
          description: "เบียร์อาซาฮี ขวดใหญ่ 630ml",
          price: 150,
          type: "input",
          unit: "ขวด"
        },
        {
          id: "wine_house",
          name: {
            th: "ไวน์ House Wine",
            en: "House Wine"
          },
          description: "ไวน์แดง/ขาว ขวดละ 750ml",
          price: 800,
          type: "input",
          unit: "ขวด"
        }
      ]
    },
    marketing: {
      title: {
        th: "โปรแกรมส่วนลด",
        en: "Marketing Discount"
      },
      items: [
        {
          id: "collab_program",
          name: {
            th: "โปรแกรม Couple Collab",
            en: "Couple Collab Program"
          },
          description: "รับส่วนลด ฿20,000 กรณีให้ภาพใช้ทางการตลาด / ทำรีวิวร่วมกับ RARIN / รีวิวลง Platform Online ในList",
          discount: 20000,
          type: "discount"
        },
        {
          id: "social_media_collab",
          name: {
            th: "ร่วมโปรโมททางการตลาดกับลลิล",
            en: "Co-Marketing"
          },
          description: "ให้ภาพใช้ทางการตลาด / รีวิวลง Google Maps",
          discount: 10000,
          type: "discount"
        }
      ]
    }
  }

  const handleQuantityChange = (addonId, quantity, price) => {
    const newQuantities = { ...quantities, [addonId]: quantity }
    setQuantities(newQuantities)
    
    if (quantity > 0) {
      toggleAddon(addonId, price * quantity)
    } else {
      if (addons[addonId]) {
        toggleAddon(addonId, 0) // Remove addon
      }
    }
  }

  const handleAutoFoodSelection = (foodId, price) => {
    const isChecked = !!addons[foodId]
    if (isChecked) {
      toggleAddon(foodId, 0) // Remove food
    } else {
      const totalPrice = price * people
      toggleAddon(foodId, totalPrice) // Add food calculated for all guests
    }
  }

  const handleCeremonySelection = (ceremonyId, price) => {
    // Multi-selection: toggle the ceremony addon on/off
    const isChecked = !!addons[ceremonyId]
    if (isChecked) {
      toggleAddon(ceremonyId, 0) // deselect
    } else {
      toggleAddon(ceremonyId, price) // select
    }
  }

  const handleCeremonyClick = (ceremonyId, price) => {
    // Toggle the ceremony selection when clicking on the card
    handleCeremonySelection(ceremonyId, price)
  }

  const handleDiscountToggle = (discountId, discountValue) => {
    // Toggle the selected discount. Ensure only one marketing discount is active at a time.
    const isChecked = !!addons[discountId]

    // Remove all other marketing discounts (but don't remove the one we're toggling yet)
    Object.keys(addons).forEach(addonId => {
      if ((addonId.includes('collab') || addonId.includes('social') || addonId.includes('marketing')) && addonId !== discountId) {
        toggleAddon(addonId, 0)
      }
    })

    if (isChecked) {
      // If it's already selected, deselect it
      toggleAddon(discountId, 0)
    } else {
      // Otherwise add it as a negative value (discount)
      toggleAddon(discountId, -Math.abs(discountValue))
    }
  }

  // Render config-based addons for event and photo types
  const renderConfigAddons = () => {
    return (
      <div className="space-y-6">
        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {Object.entries(configAddons).map(([categoryKey, categoryData]) => (
            <button
              key={categoryKey}
              onClick={() => setActiveTab(categoryKey)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === categoryKey
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {categoryData.title[language] || categoryData.title.th}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        {activeTab && configAddons[activeTab] && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 pb-2 border-b border-stone-200">
              {configAddons[activeTab].title[language] || configAddons[activeTab].title.th}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {configAddons[activeTab].items.map(item => {
                const checked = !!addons[item.id]
                const quantity = quantities[item.id] || 0
                const itemName = item.name[language] || item.name.th

                // Checkbox type - simple selection
                if (item.type === 'checkbox') {
                  return (
                    <div
                      key={item.id}
                      className={`relative pt-8 px-4 pb-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                        checked ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-stone-300 hover:border-orange-400'
                      }`}
                      onClick={() => {
                        if (checked) {
                          toggleAddon(item.id, 0)
                        } else {
                          toggleAddon(item.id, item.price)
                        }
                      }}
                    >
                        {/* Selection toggle (top-right) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); 
                            if (checked) {
                              toggleAddon(item.id, 0)
                            } else {
                              toggleAddon(item.id, item.price)
                            }
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                          aria-pressed={checked}
                          title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                        >
                          {checked && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>                      <div className="text-center">
                        <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                        {item.minGuests && (
                          <div className="text-xs text-gray-500 mb-2 font-medium">
                            {language === 'th' ? `ขั้นต่ำ ${item.minGuests} ท่าน` : `Minimum ${item.minGuests} guests`}
                          </div>
                        )}
                        <div className="text-sm text-stone-600 mb-3 leading-relaxed h-12 flex items-center justify-center">
                          {item.description}
                        </div>
                        <div className={`text ${checked ? 'font-bold text-orange-600' : 'text-stone-700 font-semibold'}`}>
                          ฿{item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                }

                // Grid type - calculated per person
                if (item.type === 'grid') {
                  const totalPrice = item.price * people
                  return (
                    <div
                      key={item.id}
                      className={`relative pt-8 px-4 pb-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                        checked ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-stone-300 hover:border-orange-400'
                      }`}
                      onClick={() => {
                        if (checked) {
                          toggleAddon(item.id, 0)
                        } else {
                          toggleAddon(item.id, totalPrice)
                        }
                      }}
                    >
                        {/* Selection toggle (top-right) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); 
                            if (checked) {
                              toggleAddon(item.id, 0)
                            } else {
                              toggleAddon(item.id, totalPrice)
                            }
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                          aria-pressed={checked}
                          title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                        >
                          {checked && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>                      <div className="text-center">
                        <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                        {item.minGuests && (
                          <div className="text-xs text-gray-500 mb-2 font-medium">
                            {language === 'th' ? `ขั้นต่ำ ${item.minGuests} ท่าน` : `Minimum ${item.minGuests} guests`}
                          </div>
                        )}
                        <div className="text-sm text-stone-600 mb-3 leading-relaxed h-12 flex items-center justify-center">
                          {item.description}
                        </div>
                        <div className={`text ${checked ? 'font-bold text-orange-600' : 'text-stone-700 font-semibold'}`}>
                          ฿{item.price.toLocaleString()} / {item.unit}
                        </div>
                        {checked && (
                          <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                            รวม: ฿{totalPrice.toLocaleString()} (สำหรับ {people} คน)
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                // Input type - quantity-based
                if (item.type === 'input') {
                  const totalPrice = quantity * item.price
                  return (
                    <div key={item.id} className={`relative pt-8 px-4 pb-4 border-2 rounded-xl transition-all ${
                      checked ? 'border-orange-500 bg-orange-50' : 'border-stone-300 hover:border-orange-300'
                    }`}>
                        {/* Selection toggle (top-right) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); 
                            if (quantity > 0) {
                              handleQuantityChange(item.id, 0, item.price)
                            } else {
                              handleQuantityChange(item.id, 1, item.price)
                            }
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                          aria-pressed={checked}
                          title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                        >
                          {checked && (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                          {item.minGuests && (
                            <div className="text-xs text-gray-500 mt-1 font-medium">
                              {language === 'th' ? `ขั้นต่ำ ${item.minGuests} ท่าน` : `Minimum ${item.minGuests} guests`}
                            </div>
                          )}
                          <div className="text-sm text-stone-600 mt-2 leading-relaxed">{item.description}</div>
                          <div className={`text ${checked ? 'text-orange-600 font-semibold' : 'text-stone-700 font-semibold'} mt-3`}>
                            ฿{item.price.toLocaleString()} / {item.unit}
                          </div>
                          {quantity > 0 && (
                            <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                              รวม: ฿{totalPrice.toLocaleString()} ({quantity} {item.unit})
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-stone-600 mb-2 font-medium">จำนวน {item.unit}</div>
                          <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.price)}
                            className="w-20 px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-semibold focus:border-orange-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {language === 'th' ? 'เลือกบริการเสริม' : 'Choose Services'}
        </h2>
        <p className="text-gray-600">
          {type === 'wedding' 
            ? (language === 'th' ? 'เลือกบริการเสริมสำหรับงานแต่งงานของคุณ' : 'Select additional services for your wedding')
            : type === 'event'
            ? (language === 'th' ? 'เลือกบริการเสริมสำหรับงานอีเวนต์ของคุณ' : 'Select additional services for your event')
            : (language === 'th' ? 'เลือกบริการเสริมสำหรับการถ่ายภาพของคุณ' : 'Select additional services for your photo session')
          }
        </p>
      </div>

      {/* Render different content based on event type */}
      {type === 'wedding' ? (
        /* Wedding addons with tabbed interface */
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {Object.entries(customServices).map(([categoryKey, categoryData]) => (
              <button
                key={categoryKey}
                onClick={() => setActiveTab(categoryKey)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === categoryKey
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {categoryData.title[language] || categoryData.title.th}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          {activeTab && customServices[activeTab] && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 pb-2 border-b border-stone-200">
                {customServices[activeTab].title[language] || customServices[activeTab].title.th}
                {activeTab === 'food' && (
                  <div className="text-sm font-normal text-stone-500 mt-1">
                    ราคายังไม่รวม VAT 7%
                  </div>
                )}
              </h3>
              
              <div className={`${activeTab === 'food' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                {customServices[activeTab].items.map(item => {
              const checked = !!addons[item.id]
              const quantity = quantities[item.id] || 0
              const itemName = item.name[language] || item.name.th

              // Checkbox type (Ceremony Services - expandable with details)
              if (item.type === 'checkbox') {
                const isExpanded = expandedCeremony === item.id

                // If not expanded, show collapsed version
                if (!isExpanded) {
                  return (
                    <div
                        key={item.id}
                        className={`relative pt-10 px-6 pb-6 border rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                          checked ? 'border-2 border-orange-500 bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleCeremonyClick(item.id, item.price)}
                      >
                      {/* Recommend badge (optional) */}
                      {item.recommend && (
                        <div className="absolute -top-3 left-4">
                          <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            {language === 'th' ? 'แนะนำ' : 'RECOMMEND'}
                          </span>
                        </div>
                      )}

                      {/* Selection toggle (top-right) - clicking this toggles selection only */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCeremonySelection(item.id, item.price) }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                        aria-pressed={checked}
                        title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                      >
                        {checked && (
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="mb-3">
                        <div className="font-semibold text-stone-800 text-lg">{item.name[language] || item.name.th}</div>
                        {item.minGuests && (
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            {language === 'th' ? `ขั้นต่ำ ${item.minGuests} คน` : `Min. ${item.minGuests} guests`}
                          </div>
                        )}
                        <div className="text-sm text-stone-600 mt-1">{item.description}</div>
                      </div>

                      {/* Price: label and value on the same line; value normal weight */}
                      <div className="absolute top-12 right-3 text-right text-sm">
                        <span className="text-stone-500 text-xs mr-2">{language === 'th' ? 'ราคา' : 'Price'}</span>
                        <span className="text-stone-700">฿{item.price.toLocaleString()}</span>
                      </div>

                      {/* Short included list (first few details) */}
                      {item.details && (
                        <div>
                          <div className="text-sm font-medium text-stone-700 mb-2">{language === 'th' ? 'สิ่งที่ได้รับรวม' : 'What’s included'}</div>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {item.details.slice(0, 6).map((d, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-orange-400 mr-2">•</span>
                                <span className="leading-snug">{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                }

                // Expanded version with details
                return (
                  <div 
                    key={item.id} 
                    className={`pt-10 px-6 pb-6 border rounded-xl cursor-pointer transition-all shadow-lg ${
                      checked ? ' border-2 border-orange-400 bg-orange-50' : 'border-gray-300 bg-white'
                    }`}
                    onClick={() => handleCeremonyClick(item.id, item.price)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.shortName[language] || item.shortName.th}</h3>
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        <div className="text font-bold text-orange-600">
                          ฿{item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className={`w-6 h-6 flex items-center justify-center ${checked ? 'border-2 border-orange-400 bg-orange-400 rounded-full' : ''}`}>
                        {checked ? <div className="w-3 h-3 rounded-full bg-white" /> : null}
                      </div>
                    </div>

                    {/* Details Section */}
                    {item.details && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3">รายละเอียดการจัดงาน</h4>
                        <ul className="space-y-1">
                          {item.details.map((detail, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-orange-400 mr-2">•</span>
                              <span className="text-sm text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              }

              // Auto type (Food & Beverage - multi-selection cards)
              if (item.type === 'auto') {
                const totalPrice = item.price * people
                return (
                  <div 
                    key={item.id} 
                    className={`relative pt-8 px-4 pb-4 border rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                      checked ? 'border-2 border-orange-500 bg-orange-50/30 shadow-md' : 'border-stone-300 hover:border-orange-400'
                    }`}
                    onClick={() => handleAutoFoodSelection(item.id, item.price)}
                  >
                    {/* Selection toggle (top-right) - clicking this toggles selection only */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAutoFoodSelection(item.id, item.price) }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                      aria-pressed={checked}
                      title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                    >
                      {checked && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="text-center">
                      <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                      {item.minGuests && (
                        <div className="text-xs text-gray-500 font-medium mb-1">
                          {language === 'th' ? `ขั้นต่ำ ${item.minGuests} คน` : `Min. ${item.minGuests} guests`}
                        </div>
                      )}
                      <div className="text-sm text-stone-600 mb-3 leading-relaxed h-12 flex items-center justify-center">
                        {item.description}
                      </div>
                      <div className={`text ${checked ? 'font-bold text-orange-600' : 'text-stone-700 font-semibold'}`}>
                        ฿{item.price.toLocaleString()} / {item.unit}
                      </div>
                      {checked && (
                        <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                          รวม: ฿{totalPrice.toLocaleString()} (สำหรับ {people} คน)
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Input type (Liquor - calculated per order/glasses)
              if (item.type === 'input') {
                const totalPrice = quantity * item.price
                return (
                  <div key={item.id} className={`relative pt-8 px-4 pb-4 border rounded-xl transition-all ${checked ? 'border-2 border-orange-500 bg-orange-50/30' : 'border-stone-300 hover:border-orange-300'}`}>
                    {/* Selection toggle (top-right) - clicking this toggles selection only */}
                    <button
                      onClick={(e) => { e.stopPropagation(); /* if already selected -> deselect; otherwise select with 1 unit */
                        if (quantity > 0) {
                          handleQuantityChange(item.id, 0, item.price)
                        } else {
                          handleQuantityChange(item.id, 1, item.price)
                        }
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                      aria-pressed={checked}
                      title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                    >
                      {checked && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                        {item.minGuests && (
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            {language === 'th' ? `ขั้นต่ำ ${item.minGuests} คน` : `Min. ${item.minGuests} guests`}
                          </div>
                        )}
                        <div className="text-sm text-stone-600 mt-2 leading-relaxed">{item.description}</div>
                        <div className={`text ${checked ? 'text-orange-600 font-semibold' : 'text-stone-700 font-semibold'} mt-3`}>
                          ฿{item.price.toLocaleString()} / {item.unit}
                        </div>
                        {quantity > 0 && (
                          <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                            รวม: ฿{totalPrice.toLocaleString()} ({quantity} {item.unit})
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-stone-600 mb-2 font-medium">จำนวน {item.unit}</div>
                        <input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.price)}
                          className="w-20 px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-semibold focus:border-orange-500 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )
              }

              // Discount type (Marketing Discount)
              if (item.type === 'discount') {
                const discountValue = typeof item.discount === 'number' && item.discount < 1 
                  ? `${(item.discount * 100)}%` 
                  : `฿${item.discount.toLocaleString()}`
                
                return (
                  <div 
                    key={item.id} 
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      checked ? 'border-orange-500 bg-orange-50/30 shadow-md' : 'border-stone-300 hover:border-orange-400'
                    }`}
                    onClick={() => handleDiscountToggle(item.id, item.discount)}
                  >
                    {/* Selection toggle (top-right) - clicking this toggles selection only */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDiscountToggle(item.id, item.discount) }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                      aria-pressed={checked}
                      title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                    >
                      {checked && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                        <div className="text-sm text-stone-600 mt-2 leading-relaxed">{item.description}</div>
                        <div className="text font-bold text-orange-900 mt-3">
                          ลด {discountValue}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return null
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Config-based addons for Event and Photo types */
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {Object.entries(configAddons).map(([categoryKey, categoryData]) => (
              <button
                key={categoryKey}
                onClick={() => setActiveTab(categoryKey)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === categoryKey
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {categoryData.title[language] || categoryData.title.th}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          {activeTab && configAddons[activeTab] && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 pb-2 border-b border-stone-200">
                {configAddons[activeTab].title[language] || configAddons[activeTab].title.th}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {configAddons[activeTab].items.map(item => {
                  const checked = !!addons[item.id]
                  const quantity = quantities[item.id] || 0
                  const itemName = item.name[language] || item.name.th

                  // Checkbox type - simple selection
                  if (item.type === 'checkbox') {
                    return (
                      <div
                        key={item.id}
                        className={`relative pt-8 px-4 pb-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                          checked ? 'border-2 border-orange-500 bg-orange-50/30 shadow-md' : 'border-stone-300 hover:border-orange-400'
                        }`}
                        onClick={() => {
                          if (checked) {
                            toggleAddon(item.id, 0)
                          } else {
                            toggleAddon(item.id, item.price)
                          }
                        }}
                      >
                        {/* Selection toggle (top-right) */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (checked) {
                              toggleAddon(item.id, 0)
                            } else {
                              toggleAddon(item.id, item.price)
                            }
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${checked ? 'bg-orange-500' : 'bg-white border-2 border-stone-200'}`}
                          aria-pressed={checked}
                          title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                        >
                          {checked ? (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          )}
                        </button>

                        <div className="text-center">
                          <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                          {item.minGuests && (
                            <div className="text-xs text-gray-500 font-medium mb-1">
                              {language === 'th' ? `ขั้นต่ำ ${item.minGuests} คน` : `Min. ${item.minGuests} guests`}
                            </div>
                          )}
                          <div className="text-sm text-stone-600 mb-3 leading-relaxed h-12 flex items-center justify-center">
                            {item.description}
                          </div>
                          <div className={`text ${checked ? 'font-bold text-orange-600' : 'text-stone-700 font-semibold'}`}>
                            ฿{item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Grid type - calculated per person
                  if (item.type === 'grid') {
                    const totalPrice = item.price * people
                    return (
                      <div
                        key={item.id}
                        className={`relative pt-8 px-4 pb-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                          checked ? 'border-2 border-orange-500 bg-orange-50/30 shadow-md' : 'border-stone-300 hover:border-orange-400'
                        }`}
                        onClick={() => {
                          if (checked) {
                            toggleAddon(item.id, 0)
                          } else {
                            toggleAddon(item.id, totalPrice)
                          }
                        }}
                      >
                        {/* Selection toggle (top-right) */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (checked) {
                              toggleAddon(item.id, 0)
                            } else {
                              toggleAddon(item.id, totalPrice)
                            }
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${checked ? 'bg-orange-500' : 'bg-white border-2 border-stone-200'}`}
                          aria-pressed={checked}
                          title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                        >
                          {checked ? (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          )}
                        </button>

                        <div className="text-center">
                          <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                          {item.minGuests && (
                            <div className="text-xs text-gray-500 font-medium mb-1">
                              {language === 'th' ? `ขั้นต่ำ ${item.minGuests} คน` : `Min. ${item.minGuests} guests`}
                            </div>
                          )}
                          <div className="text-sm text-stone-600 mb-3 leading-relaxed h-12 flex items-center justify-center">
                            {item.description}
                          </div>
                          <div className={`text ${checked ? 'font-bold text-orange-600' : 'text-stone-700 font-semibold'}`}>
                            ฿{item.price.toLocaleString()} / {item.unit}
                          </div>
                          {checked && (
                            <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                              รวม: ฿{totalPrice.toLocaleString()} (สำหรับ {people} คน)
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Input type - quantity-based
                  if (item.type === 'input') {
                    const totalPrice = quantity * item.price
                    return (
                      <div key={item.id} className={`relative pt-8 px-4 pb-4 border-2 rounded-xl transition-all ${
                        checked ? 'border-orange-500 bg-orange-50/30' : 'border-stone-300 hover:border-orange-300'
                      }`}>
                        {/* Selection toggle (top-right) */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (quantity > 0) {
                              handleQuantityChange(item.id, 0, item.price)
                            } else {
                              handleQuantityChange(item.id, 1, item.price)
                            }
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${checked ? 'bg-orange-500' : 'bg-white border-2 border-stone-200'}`}
                          aria-pressed={checked}
                          title={checked ? (language === 'th' ? 'ยกเลิก' : 'Deselect') : (language === 'th' ? 'เลือก' : 'Select')}
                        >
                          {checked ? (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          )}
                        </button>

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                            {item.minGuests && (
                              <div className="text-xs text-gray-500 font-medium mt-1">
                                {language === 'th' ? `ขั้นต่ำ ${item.minGuests} คน` : `Min. ${item.minGuests} guests`}
                              </div>
                            )}
                            <div className="text-sm text-stone-600 mt-2 leading-relaxed">{item.description}</div>
                            <div className={`text ${checked ? 'text-orange-600 font-semibold' : 'text-stone-700 font-semibold'} mt-3`}>
                              ฿{item.price.toLocaleString()} / {item.unit}
                            </div>
                            {quantity > 0 && (
                              <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                                รวม: ฿{totalPrice.toLocaleString()} ({quantity} {item.unit})
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-stone-600 mb-2 font-medium">จำนวน {item.unit}</div>
                            <input
                              type="number"
                              min="0"
                              value={quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.price)}
                              className="w-20 px-3 py-2 border-2 border-stone-300 rounded-lg text-center font-semibold focus:border-orange-500 focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
