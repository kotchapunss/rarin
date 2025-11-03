import React, { useState } from 'react'
import { useStore } from '../store'
import { useTranslations } from '../i18n'
import { getAddonCategories } from '../data'

export default function AddonsSelect() {
  const { addons, toggleAddon, language, people, type, budget } = useStore()
  const translations = useTranslations()
  const [quantities, setQuantities] = useState({})
  const [activeTab, setActiveTab] = useState('')

  // Check if this is a Budget4 wedding package
  const isBudget4Wedding = type === 'wedding' && budget === 'budget4'

  // Custom services for Budget4 wedding packages
  const customServices = {
    ceremony: {
      title: {
        th: "งานพิธี",
        en: "Ceremony Services"
      },
      items: [
        // {
        //   id: "engagement_ceremony",
        //   name: {
        //     th: "พิธีหมั้น",
        //     en: "Engagement Ceremony"
        //   },
        //   shortName: {
        //     th: "ENGAGEMENT CEREMONY",
        //     en: "ENGAGEMENT CEREMONY"
        //   },
        //   description: {
        //     th: "พิธีหมั้นแบบไทยครบชุด",
        //     en: "Traditional Thai engagement ceremony"
        //   },
        //   minGuests: 20,
        //   price: 15000,
        //   type: "checkbox",
        //   details: [
        //     {
        //       th: "จัดเตรียมพิธีหมั้นแบบไทยครบครัน",
        //       en: "Complete traditional Thai engagement ceremony setup"
        //     },
        //     {
        //       th: "ขันหมาก พร้อมของหวานไทยครบชุด",
        //       en: "Khan Maak with complete traditional Thai sweets"
        //     },
        //     {
        //       th: "อุปกรณ์พิธีการและการตกแต่ง",
        //       en: "Ceremonial equipment and decorations"
        //     },
        //     {
        //       th: "ชุดไทยสำหรับคู่บ่าวสาว (เช่า)",
        //       en: "Traditional Thai costumes for couple (rental)"
        //     },
        //     {
        //       th: "ช่างแต่งหน้าและทำผม",
        //       en: "Makeup artist and hair stylist"
        //     },
        //     {
        //       th: "ช่างภาพงานพิธีการ",
        //       en: "Ceremony photographer"
        //     },
        //     {
        //       th: "พิธีกรดำเนินรายการ",
        //       en: "Master of ceremony"
        //     },
        //     {
        //       th: "วงดนตรีไทยประกอบพิธี",
        //       en: "Traditional Thai music accompaniment"
        //     },
        //     {
        //       th: "ขนมไทยและผลไม้สำหรับแขก",
        //       en: "Thai sweets and fruits for guests"
        //     }
        //   ]
        // },
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
          description: {
            th: "พิธีรดน้ำสังข์แบบไทย",
            en: "Traditional Thai water blessing ceremony"
          },
          minGuests: 50,
          price: 35000,
          type: "checkbox",
          details: [
            {
              th: "จัดเตรียมพิธีแลกแหวนครบครัน",
              en: "Ring exchange ceremony setup"
            },
            {
              th: "โต๊ะหมู่บูชาพร้อมอุปกรณ์พิธี",
              en: "Buddha Altar Set for blessings"
            },
            {
              th: "ชุดอุปกรณ์พิธีรดน้ำสังข์และผงขมิ้น",
              en: "Blessing Ceremony Set with holy powder"
            },
            {
              th: "สายสิญจน์คู่สำหรับพิธี",
              en: "Twin blessing cords for ceremony"
            },
            {
              th: "พวงมาลัยเจ้าบ่าวเจ้าสาว (1 คู่)",
              en: "Bride & Groom Floral Garlands (1 Pair)"
            },
            {
              th: "เก้าอี้สำหรับแขก 80 ตัว",
              en: "80 Chairs for guests"
            },
            {
              th: "ถาดใส่แหวนพิธีการ",
              en: "Ceremonial ring tray"
            },
            {
              th: "น้ำศักดิ์สิทธิ์และภาชนะพิธี",
              en: "Holy water and ceremonial vessels"
            },
            {
              th: "กลีบดอกไม้และกุหลาบตกแต่ง",
              en: "Flower petals and rose decorations"
            },
            {
              th: "ผ้าไทยสำหรับพื้นที่นั่งแขก",
              en: "Thai fabric for guest seating area"
            }
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
          description: {
            th: "พิธีสงฆ์สวดมนต์ถวายพร",
            en: "Buddhist monk blessing ceremony"
          },
          minGuests: 30,
          price: 35000,
          type: "checkbox",
          details: [
            {
              th: "โต๊ะหมู่บูชาสำหรับถวายสังฆทาน",
              en: "Buddha Altar Set for ceremonial offering"
            },
            {
              th: "เวทีและอุปกรณ์พิธีสงฆ์",
              en: "Monk Ceremony Stage & Equipment setup"
            },
            {
              th: "เสื่อและหมอนนั่งสำหรับพระสงฆ์",
              en: "Monk seating mats and cushions"
            },
            {
              th: "ชุดของไทยถวายพระสงฆ์",
              en: "Traditional offering sets for monks"
            },
            {
              th: "น้ำศักดิ์สิทธิ์และสายสิญจน์",
              en: "Holy water bowl and sacred thread"
            },
            {
              th: "เชิญพระสงฆ์ 9 รูป พร้อมประสานงาน",
              en: "Invitation of 9 Monks with coordination"
            },
            {
              th: "บริการรับส่งพระสงฆ์ไป-กลับ",
              en: "Round-trip transportation service for monks"
            },
            {
              th: "อาหารและเครื่องดื่มสำหรับพระสงฆ์",
              en: "Monk meal and refreshments"
            },
            {
              th: "เทียนและดอกไม้สำหรับบูชา",
              en: "Candles and flowers for worship"
            },
            {
              th: "ผ้าไทยสำหรับพื้นที่ฟังธรรม",
              en: "Thai fabric for Dharma listening area"
            }
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
          description: {
            th: "พิธียกน้ำชาแบบจีน",
            en: "Traditional Chinese tea ceremony"
          },
          minGuests: 30,
          price: 35000,
          type: "checkbox",
          details: [
            {
              th: "จัดเตรียมพิธีแลกแหวนครบครัน",
              en: "Ring exchange ceremony setup"
            },
            {
              th: "บริการน้ำชาจีนสำหรับแขก 50 ท่าน",
              en: "Chinese tea service for 50 guests"
            },
            {
              th: "ชุดน้ำชาพิธีการระดับพรีเมียม",
              en: "Premium ceremony tea services"
            },
            {
              th: "ชุดโซฟาหรูหราสำหรับคู่บ่าวสาว",
              en: "Elegant sofa set for couple"
            },
            {
              th: "เก้าอี้สำหรับแขก 50 ตัว",
              en: "50 chairs for guest seating"
            },
            {
              th: "ชุดน้ำชาจีนแบบดั้งเดิม",
              en: "Traditional Chinese tea sets"
            },
            {
              th: "ขนมประกอบน้ำชาและของหวาน",
              en: "Tea accompaniments and sweets"
            },
            {
              th: "การชงน้ำชาแบบพิธีการ",
              en: "Ceremonial tea preparation"
            },
            {
              th: "ประสานงานพิธียกน้ำชา",
              en: "Tea ceremony coordination"
            },
            {
              th: "ช่างภาพบันทึกช่วงเวลาสำคัญ",
              en: "Photography for key moments"
            }
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
          description: {
            th: "พิธีสาบานตนแลกแหวนแต่งงาน",
            en: "Wedding vow and ring exchange ceremony"
          },
          minGuests: 40,
          price: 35000,
          type: "checkbox",
          details: [
            {
              th: "จัดเวทีพิธีการอย่างหรูหรา",
              en: "Elegant ceremony stage setup"
            },
            {
              th: "จุดกลีบดอกไม้หลากหลายจุด",
              en: "Multiple petal stations for decoration"
            },
            {
              th: "เก้าอี้ 80 ตัว จัดเรียงให้มองเห็นชัดเจน",
              en: "80 chairs arranged for optimal viewing"
            },
            {
              th: "ถาดใส่แหวนพิธีการพร้อมการตกแต่ง",
              en: "Ceremonial ring tray with decoration"
            },
            {
              th: "ไมโครโฟนและระบบเสียง",
              en: "Microphone and sound system"
            },
            {
              th: "การจัดดอกไม้และการตกแต่ง",
              en: "Floral arrangements and decorations"
            },
            {
              th: "พรมเดินและกลีบดอกไม้",
              en: "Aisle runner and petals"
            },
            {
              th: "ประสานงานพิธีการ",
              en: "Ceremony coordination"
            },
            {
              th: "ช่างภาพบันทึกการแลกคำสาบาน",
              en: "Photography for vow exchange"
            },
            {
              th: "จัดเพลงประกอบพิธี",
              en: "Background music arrangement"
            }
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
          description: {
            th: "10 รายการ (อาหาร 7 อย่าง, ของหวาน 2 ที่, ข้าวและเครื่องดื่ม 3 รายการ)",
            en: "10 items (7 dishes, 2 desserts, rice and 3 beverages)"
          },
          minGuests: 30,
          price: 950,
          type: "auto",
          unit: {
            th: "ท่าน",
            en: "person"
          }
        },
        {
          id: "deluxe_international_buffet",
          name: {
            th: "Deluxe International Buffet",
            en: "Deluxe International Buffet"
          },
          description: {
            th: "9 รายการ (อาหาร 7 อย่าง, ของหวาน 2 ชิ้น, เครื่องดื่ม 3 รายการ)",
            en: "9 items (7 dishes, 2 desserts, 3 beverages)"
          },
          minGuests: 40,
          price: 1290,
          type: "auto",
          unit: {
            th: "ท่าน",
            en: "person"
          }
        },
        {
          id: "delight_cocktail",
          name: {
            th: "Delight Cocktail",
            en: "Delight Cocktail"
          },
          description: {
            th: "10 รายการ (คาบาป 10 รายการ และเครื่องดื่ม 3 รายการ) ดื่มฟรีอาหาร 3 ชั่วโมง",
            en: "10 items (10 canapes and 3 beverages) with 3-hour free drinks"
          },
          price: 950,
          type: "auto",
          unit: {
            th: "ท่าน",
            en: "person"
          }
        },
        {
          id: "stylish_heavy_cocktail",
          name: {
            th: "Stylish Heavy Cocktail",
            en: "Stylish Heavy Cocktail"
          },
          description: {
            th: "14 รายการ (คาบาป 8 อย่าง, ของหวาน 2 ชิ้น, ขนมคาบาป 4 รายการ, เครื่องดื่ม 4 รายการ)",
            en: "14 items (8 canapes, 2 desserts, 4 heavy snacks, 4 beverages)"
          },
          price: 1590,
          type: "auto",
          unit: {
            th: "ท่าน",
            en: "person"
          }
        },
        {
          id: "classic_chinese_table",
          name: {
            th: "Classic Chinese Table",
            en: "Classic Chinese Table"
          },
          description: {
            th: "9 รายการ (อาหาร 8 อย่าง, ของหวาน 1 ชิ้น, เครื่องดื่ม 2 รายการ) เปลี่ยนโต๊ะ 10 ท่าน",
            en: "9 items (8 dishes, 1 dessert, 2 beverages) per table of 10 people"
          },
          price: 9900,
          type: "auto",
          unit: {
            th: "10 ท่าน",
            en: "10 people"
          }
        },
        {
          id: "deluxe_chinese_table",
          name: {
            th: "Deluxe Chinese Table",
            en: "Deluxe Chinese Table"
          },
          description: {
            th: "9 รายการ (อาหาร 8 อย่าง, ของหวาน 1 ชิ้น, เครื่องดื่ม 2 รายการ) เปลี่ยนโต๊ะ 10 ท่าน",
            en: "9 items (8 dishes, 1 dessert, 2 beverages) per table of 10 people"
          },
          price: 13900,
          type: "auto",
          unit: {
            th: "10 ท่าน",
            en: "10 people"
          }
        },
        {
          id: "stylish_international_buffet",
          name: {
            th: "Stylish International Buffet",
            en: "Stylish International Buffet"
          },
          description: {
            th: "9 รายการ (อาหาร 8 อย่าง, ของหวาน 1 ชิ้น, เครื่องดื่ม 2 รายการ) เปลี่ยนโต๊ะ 10 ท่าน",
            en: "9 items (8 dishes, 1 dessert, 2 beverages) per table of 10 people"
          },
          minGuests: 50,
          price: 1590,
          type: "auto",
          unit: {
            th: "ท่าน",
            en: "person"
          }
        },
        {
          id: "western_thai_course_menu",
          name: {
            th: "5 Western / Thai Course Menu",
            en: "5 Western / Thai Course Menu"
          },
          description: {
            th: "5 รายการ (Appetizer / Salad / Soup / Main Course / Dessert)",
            en: "5 courses (Appetizer / Salad / Soup / Main Course / Dessert)"
          },
          price: 1800,
          type: "auto",
          unit: {
            th: "ท่าน",
            en: "person"
          }
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
            th: "เบียร์สิงห์ / ลีโอ / ช้าง / อาซาฮี",
            en: "Singha / Leo / Change / Asahi"
          },
          description: {
            th: "เบียร์ถัง 30 ลิตร รองรับ 60 แก้ว",
            en: "Beer bucket 30 liters, serves 60 glasses"
          },
          price: 13990,
          type: "input",
          unit: {
            th: "ถัง",
            en: "bucket"
          }
        },
        {
          id: "wine_house",
          name: {
            th: "House Wine",
            en: "House Wine"
          },
          description: {
            th: "ไวน์แดง / ไวน์ขาว 12 ขวด ขวดละ 750ml",
            en: "Red/White wine 12 bottles 750ml each"
          },
          price: 9900,
          type: "input",
          unit: {
            th: "12 ขวด",
            en: "12 bottle"
          }
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
          description: {
            th: "รับส่วนลด ฿20,000 กรณีให้ภาพใช้ทางการตลาด / ทำรีวิวร่วมกับ RARIN / รีวิวลง Platform Online ในList",
            en: "Get ฿20,000 discount for providing photos for marketing / joint review with RARIN / online platform reviews"
          },
          discount: 20000,
          type: "discount"
        },
        {
          id: "social_media_collab",
          name: {
            th: "ร่วมโปรโมททางการตลาดกับลลิล",
            en: "Co-Marketing"
          },
          description: {
            th: "ให้ภาพใช้ทางการตลาด / รีวิวลง Google Maps",
            en: "Provide photos for marketing / Google Maps reviews"
          },
          discount: 10000,
          type: "discount"
        }
      ]
    }
  }

  // Get addon categories based on package type
  const addonCategories = isBudget4Wedding 
    ? customServices 
    : {
        liquor: {
          title: {
            th: "เครื่องดื่มแอลกอฮอล์",
            en: "Alcoholic Beverages"
          },
          items: [
            {
              id: "beer_singha",
              name: {
                th: "เบียร์สิงห์ / ลีโอ / ช้าง / อาซาฮี",
                en: "Singha / Leo / Change / Asahi"
              },
              description: {
                th: "เบียร์ถัง 30 ลิตร รองรับ 60 แก้ว",
                en: "Beer bucket 30 liters, serves 60 glasses"
              },
              price: 13990,
              type: "input",
              unit: {
                th: "ถัง",
                en: "bucket"
              }
            },
            {
              id: "wine_house",
              name: {
                th: "House Wine",
                en: "House Wine"
              },
              description: {
                th: "ไวน์แดง / ไวน์ขาว 12 ขวด ขวดละ 750ml",
                en: "Red/White wine 12 bottles 750ml each"
              },
              price: 9900,
              type: "input",
              unit: {
                th: "12 ขวด",
                en: "12 bottle"
              }
            }
          ]
        }
      }

  // Set default active tab when addonCategories changes
  React.useEffect(() => {
    if (Object.keys(addonCategories).length > 0 && !activeTab) {
      setActiveTab(Object.keys(addonCategories)[0])
    }
  }, [addonCategories, activeTab])

  const handleQuantityChange = (addonId, quantity, price) => {
    const newQuantities = { ...quantities, [addonId]: quantity }
    setQuantities(newQuantities)
    
    if (quantity > 0) {
      toggleAddon(addonId, price * quantity)
    } else {
      if (addons[addonId]) {
        toggleAddon(addonId, 0)
      }
    }
  }

  const handleAutoAddonToggle = (addonId, unitPrice, unit, categoryKey) => {
    const isChecked = !!addons[addonId]
    
    // For budget4 wedding, clear other selections in the same category (single selection per category)
    if (isBudget4Wedding && !isChecked) {
      // Clear other items in the same category
      const categoryItems = customServices[categoryKey]?.items || []
      categoryItems.forEach(item => {
        if (item.id !== addonId && addons[item.id]) {
          toggleAddon(item.id, 0)
        }
      })
    }
    
    if (isChecked) {
      toggleAddon(addonId, 0)
    } else {
      // Calculate price based on people count and unit
      let quantity = people || 1
      const unitText = typeof unit === 'object' ? (unit.th || unit.en || '') : unit
      if (unitText === '10 ท่าน' || unitText === '10 people') {
        quantity = Math.ceil((people || 1) / 10)
      }
      toggleAddon(addonId, unitPrice * quantity)
    }
  }

  const handleCeremonyClick = (ceremonyId, price, categoryKey) => {
    const isChecked = !!addons[ceremonyId]
    
    // For budget4 wedding, clear other selections in the same category (single selection per category)
    if (isBudget4Wedding && !isChecked) {
      // Clear other items in the same category
      const categoryItems = customServices[categoryKey]?.items || []
      categoryItems.forEach(item => {
        if (item.id !== ceremonyId && addons[item.id]) {
          toggleAddon(item.id, 0)
        }
      })
    }
    
    if (isChecked) {
      toggleAddon(ceremonyId, 0)
    } else {
      toggleAddon(ceremonyId, price)
    }
  }

  const handleDiscountToggle = (discountId, discountValue) => {
    const isChecked = !!addons[discountId]
    Object.keys(addons).forEach(addonId => {
      if ((addonId.includes('collab') || addonId.includes('social') || addonId.includes('marketing')) && addonId !== discountId) {
        toggleAddon(addonId, 0)
      }
    })
    if (isChecked) {
      toggleAddon(discountId, 0)
    } else {
      toggleAddon(discountId, -Math.abs(discountValue))
    }
  }

  // Check if we're in wedding flow (5 steps) or other flow (4 steps)
  const isWeddingFlow = type === 'wedding'
  
  return (
    <div className="space-y-6">
      {/* Step Header - Wedding Step 5, Others Step 4 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isWeddingFlow ? translations.step5WeddingTitle : translations.step4Title}
        </h2>
        <p className="text-gray-600">
          {isWeddingFlow ? translations.step5WeddingDescription : translations.step4Description}
        </p>
      </div>

      {/* Tabs Navigation - Only show for budget4 wedding packages */}
      {isBudget4Wedding && (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 bg-gray-100">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg min-w-max md:min-w-0">
            {Object.entries(addonCategories).map(([categoryKey, categoryData]) => (
              <button
                key={categoryKey}
                onClick={() => setActiveTab(categoryKey)}
                className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === categoryKey
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {typeof categoryData.title === 'object' 
                  ? (categoryData.title[language] || categoryData.title.th || categoryData.title.en || '')
                  : (categoryData.title || '')
                }
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Tab Content */}
      {activeTab && addonCategories[activeTab] && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 pb-2 border-b border-stone-200">
            {typeof addonCategories[activeTab].title === 'object' 
              ? (addonCategories[activeTab].title[language] || addonCategories[activeTab].title.th || addonCategories[activeTab].title.en || '')
              : (addonCategories[activeTab].title || '')
            }
            {/* Show single selection note for budget4 wedding */}
            {isBudget4Wedding && (
              <div className="text-sm font-normal text-grey-600 mt-1">
                {activeTab === 'ceremony' && (language === 'th' 
                  ? '* เลือกพิธีการ 1 แบบสำหรับงานแต่งงานของคุณ' 
                  : '* Select one ceremony type for your wedding'
                )}
                {activeTab === 'food' && (language === 'th' 
                  ? '* เลือกอาหารและเครื่องดื่ม 1 แบบสำหรับแขกของคุณ' 
                  : '* Select one food & beverage package for your guests'
                )}
                {activeTab === 'liquor' && (language === 'th' 
                  ? '* เลือกเครื่องดื่มแอลกอฮอล์ตามต้องการ (สามารถเลือกหลายอย่าง)' 
                  : '* Select alcoholic beverages as needed (multiple selection allowed)'
                )}
                {activeTab === 'marketing' && (language === 'th' 
                  ? '* เลือกโปรแกรมส่วนลด 1 แบบเพื่อประหยัดค่าใช้จ่าย' 
                  : '* Select one discount program to save costs'
                )}
              </div>
            )}
            {activeTab === 'food' && (
              <div className="text-sm font-normal text-stone-500 mt-1">
                {translations.priceExcludesVat || (language === 'th' ? '* ราคายังไม่รวม VAT 7%' : '* Price excludes VAT 7%')}
              </div>
            )}
          </h3>
          
          <div className={`${activeTab === 'food' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
            {addonCategories[activeTab].items.map(item => {
              const checked = !!addons[item.id]
              const quantity = quantities[item.id] || 0
              const itemName = typeof item.name === 'object' 
                ? (item.name[language] || item.name.th || item.name.en || '')
                : (item.name || '')

              // Checkbox type (like Ceremony Services)
              if (item.type === 'checkbox') {
                return (
                  <div
                    key={item.id}
                    className={`relative pt-10 px-6 pb-6 border rounded-xl cursor-pointer transition-all hover:shadow-md bg-white ${
                      checked ? 'border-2 border-orange-500 bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCeremonyClick(item.id, item.price, activeTab)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (checked) {
                          toggleAddon(item.id, 0)
                        } else {
                          handleCeremonyClick(item.id, item.price, activeTab)
                        }
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-orange-500' : ''}`}
                      aria-pressed={checked}
                      title={checked ? (translations.deselect || (language === 'th' ? 'ยกเลิกการเลือก' : 'Deselect')) : (translations.select || (language === 'th' ? 'เลือก' : 'Select'))}
                    >
                      {checked && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="mb-3">
                      <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                      {item.minGuests && (
                        <div className="text-xs text-gray-500 font-medium mt-1">
                          {translations.minimumGuests || (language === 'th' ? 'ขั้นต่ำ' : 'Min.')} {item.minGuests} {translations.guests || (language === 'th' ? 'คน' : 'guests')}
                        </div>
                      )}
                      <div className="text-sm text-stone-600 mt-1">
                        {typeof item.description === 'object' 
                          ? (item.description[language] || item.description.th || item.description.en || '')
                          : (item.description || '')
                        }
                      </div>
                    </div>

                    <div className="absolute top-12 right-3 text-right text-sm">
                      <span className="text-stone-500 text-xs mr-2">{translations.price || (language === 'th' ? 'ราคา' : 'Price')}</span>
                      <span className="text-stone-700">฿{item.price.toLocaleString()}</span>
                    </div>

                    {item.details && (
                      <div>
                        <div className="text-sm font-medium text-stone-700 mb-2">{translations.included || (language === 'th' ? 'รวมในแพ็กเกจ' : 'Included')}</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {item.details.slice(0, 6).map((detail, i) => {
                            // Handle both string details and object details with language keys
                            const detailText = typeof detail === 'object' 
                              ? (detail[language] || detail.th || detail.en || '')
                              : detail;
                            
                            return (
                              <li key={i} className="flex items-start">
                                <span className="text-orange-400 mr-2">•</span>
                                <span className="leading-snug">{detailText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              }

              // Input type - quantity based (like beverages)
              if (item.type === 'input') {
                const totalPrice = quantity * item.price
                const itemUnit = typeof item.unit === 'object' 
                  ? (item.unit[language] || item.unit.th || item.unit.en || '')
                  : (item.unit || '')
                
                return (
                  <div key={item.id} className={`relative pt-8 px-4 pb-4 border-2 rounded-xl transition-all ${
                    checked ? 'border-orange-500 bg-orange-50' : 'border-stone-300 hover:border-orange-300'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                        <div className="text-sm text-stone-600 mt-2 leading-relaxed">
                          {typeof item.description === 'object' 
                            ? (item.description[language] || item.description.th || item.description.en || '')
                            : (item.description || '')
                          }
                        </div>
                        <div className={`text ${checked ? 'text-orange-600 font-semibold' : 'text-stone-700 font-semibold'} mt-3`}>
                          ฿{item.price.toLocaleString()} / {itemUnit}
                        </div>
                        {quantity > 0 && (
                          <div className="mt-3 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                            {translations.total || (language === 'th' ? 'ยอดรวม' : 'Total')}: ฿{totalPrice.toLocaleString()} ({quantity} {itemUnit})
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-stone-600 mb-2 font-medium">{translations.quantity || (language === 'th' ? 'จำนวน' : 'Quantity')} {itemUnit}</div>
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

              // Auto type - price calculated based on number of people (like food items)
              if (item.type === 'auto') {
                const isChecked = !!addons[item.id]
                const itemUnit = typeof item.unit === 'object' 
                  ? (item.unit[language] || item.unit.th || item.unit.en || '')
                  : (item.unit || '')
                
                // Calculate quantity and total price
                let quantity = people || 1
                const unitText = typeof item.unit === 'object' ? (item.unit.th || item.unit.en || '') : item.unit
                if (unitText === '10 ท่าน' || unitText === '10 people') {
                  quantity = Math.ceil((people || 1) / 10)
                }
                const totalPrice = item.price * quantity
                
                return (
                  <div
                    key={item.id}
                    className={`relative pt-8 px-4 pb-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      isChecked ? 'border-orange-500 bg-orange-50' : 'border-stone-300 hover:border-orange-300'
                    }`}
                    onClick={() => handleAutoAddonToggle(item.id, item.price, item.unit, activeTab)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAutoAddonToggle(item.id, item.price, item.unit, activeTab)
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isChecked ? 'bg-orange-500' : ''}`}
                      aria-pressed={isChecked}
                      title={isChecked ? (translations.deselect || (language === 'th' ? 'ยกเลิกการเลือก' : 'Deselect')) : (translations.select || (language === 'th' ? 'เลือก' : 'Select'))}
                    >
                      {isChecked && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="mb-3">
                      <div className="font-semibold text-stone-800 text-lg">{itemName}</div>
                      {item.minGuests && (
                        <div className="text-xs text-gray-500 font-medium mt-1">
                          {translations.minimumGuests || (language === 'th' ? 'ขั้นต่ำ' : 'Min.')} {item.minGuests} {translations.guests || (language === 'th' ? 'คน' : 'guests')}
                        </div>
                      )}
                      <div className="text-sm text-stone-600 mt-1">
                        {typeof item.description === 'object' 
                          ? (item.description[language] || item.description.th || item.description.en || '')
                          : (item.description || '')
                        }
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <div className="text-sm text-stone-600 mb-2">
                        ฿{item.price.toLocaleString()} / {itemUnit}
                      </div>
                      {isChecked && (
                        <div className="text-xs font-medium text-gray-500 bg-gray-100/50 px-3 py-1 rounded-lg inline-block mt-2">
                          {translations.total || (language === 'th' ? 'ยอดรวม' : 'Total')}: ฿{totalPrice.toLocaleString()} ({quantity} {itemUnit})
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Marketing discount type
              if (item.type === 'discount') {
                const isChecked = !!addons[item.id]
                return (
                  <div
                    key={item.id}
                    className={`relative pt-8 px-4 pb-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      isChecked ? 'border-orange-500 bg-orange-50' : 'border-stone-300 hover:border-orange-300'
                    }`}
                    onClick={() => handleDiscountToggle(item.id, item.discount)}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-stone-800 text-lg mb-2">{itemName}</div>
                      <div className="text-sm text-stone-600 mb-3">
                        {typeof item.description === 'object' 
                          ? (item.description[language] || item.description.th || item.description.en || '')
                          : (item.description || '')
                        }
                      </div>
                      <div className="text-orange-600 font-semibold">
                        - ฿{item.discount.toLocaleString()}
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