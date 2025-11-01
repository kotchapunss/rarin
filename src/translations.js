import { useCalc } from './store'

// Translation system for Thai-English toggle
export const translations = {
  en: {
    // Header
    title: "Rarin Cost Estimation",
    subtitle: "Minimal Brown",
    demoText: "Demo UI • React + Tailwind",
    
    // Steps
    steps: ["Type", "Package", "Details", "Add‑ons"],
    
    // Navigation
    back: "Back",
    next: "Next",
    
    // Step headers
    step1Title: "Step 1",
    step1Description: "Choose your event type",
    step2Title: "Step 2",
    step2Description: "Choose the package that suits your event",
    step3Title: "Step 3", 
    step3Description: "Enter event details",
    step4Title: "Step 4",
    step4Description: "Select additional services",
    
    // Type Selector
    wedding: "Wedding",
    event: "Event", 
    photo: "Photo",
    typeDescription: "Minimal pastel brown style",
    
    // Package data
    packages: {
      wedding: {
        w1: { name: "PACKAGE A : THE VENUE", details: ["Program area", "200 Chiavari chairs", "Basic sound system"] },
        w2: { name: "PACKAGE B : THE FINEST", details: ["Special wedding package", "Complete services", "Lighting + sound"] },
        w3: { name: "PACKAGE C : THE TOTAL LOOK", details: ["Complete event management", "Organizer team", "VARAVELA services"] },
        w4: { name: "PACKAGE D : THE ELEGANCE", details: ["Luxury decoration", "Premium AV system", "Full day coverage"] },
        w5: { name: "PACKAGE E : THE PRESTIGE", details: ["Ultra luxury", "Complete service", "Multiple day coverage"] }
      },
      event: {
        e1: { name: "Gather Lite", details: ["Backdrop", "Basic sound", "Host desk"] },
        e2: { name: "Gather Pro", details: ["Backdrop + stage", "Sound set", "Coordinator"] }
      },
      photo: {
        p1: { name: "Studio Mini", details: ["1 hr", "10 edited shots", "Online gallery"] },
        p2: { name: "Studio Plus", details: ["2 hr", "25 edited shots", "Props set"] }
      }
    },
    
    // Addons
    addons: {
      wedding: {
        a1: "Extra flower arch",
        a2: "Live acoustic duo", 
        a3: "Candy bar"
      },
      event: {
        a4: "LED screen (3m)",
        a5: "Live photographer"
      },
      photo: {
        a6: "Makeup artist",
        a7: "Extra hour"
      }
    },
    
    // Package Card
    select: "Select",
    selected: "Selected",
    details: "Details",
    
    // Details Input
    numberOfGuests: "Number of guests",
    periodTime: "Period time",
    morning: "Morning",
    afternoon: "Afternoon", 
    evening: "All day",
    specialRequests: "Special requests",
    placeholder: "e.g., pastel brown theme, vegan menu section…",
    
    // Summary
    summary: "Summary",
    themeText: "Pastel brown theme",
    basePackage: "Base package",
    addOns: "Add-ons",
    extraGuests: "Extra guests",
    subtotal: "Subtotal (before VAT)",
    vat: "VAT (7%)",
    totalWithVat: "Total (with VAT)",
    estimatedTotal: "Estimated total",
    bookInquiry: "Book inquiry",
    
    // Footer
    footerText: "* This is a sample calculator UI inspired by the referenced site, redesigned with a minimal pastel‑brown theme.",
    
    // Language
    language: "Language",
    thai: "ไทย",
    english: "English",
    
    // Booking Confirmation
    estimationSummary: "Estimation Summary",
    estimationDescription: "Price summary for event planning",
    serviceSummary: "Service Summary",
    packageType: "Package fee",
    beforeVat: "Before VAT",
    totalWithVat: "Total with VAT (7%)",
    priceDisclaimer: "* This is a preliminary estimate that may change when proceeding with the actual system",
    submitRequest: "Submit Request",
    backToEdit: "Back to Edit",
    lineOA: "Line OA",
    quotation: "Quotation",
    quotationPreview: "Quotation Preview",
    close: "Close",
    downloadPdf: "Download PDF",
    quotationFilename: "quotation",
    pdfGenerationError: "Failed to generate PDF. Please try again."
  },
  
  th: {
    // Header
    title: "ราริณ คำนวณต้นทุน",
    subtitle: "น้ำตาลมินิมอล",
    demoText: "Demo UI • React + Tailwind",
    
    // Steps
    steps: ["ประเภท", "แพ็กเกจ", "รายละเอียด", "เสริม"],
    
    // Navigation
    back: "ย้อนกลับ",
    next: "ถัดไป",
    
    // Step headers
    step1Title: "ขั้นตอนที่ 1",
    step1Description: "เลือกประเภทงานของคุณ",
    step2Title: "ขั้นตอนที่ 2",
    step2Description: "เลือกแพ็กเกจที่เหมาะสมกับงานของคุณ",
    step3Title: "ขั้นตอนที่ 3",
    step3Description: "กรอกรายละเอียดงาน", 
    step4Title: "ขั้นตอนที่ 4",
    step4Description: "เลือกบริการเสริม",
    
    // Type Selector
    wedding: "งานแต่งงาน",
    event: "งานอีเวนต์",
    photo: "ถ่ายภาพ",
    typeDescription: "สไตล์น้ำตาลพาสเทลมินิมอล",
    
    // Package data
    packages: {
      wedding: {
        w1: { name: "PACKAGE A : THE VENUE", details: ["จุดโปรแกรมงาน", "เก้าอี้ Chiavari 200 ตัว", "ระบบเสียงพื้นฐาน"] },
        w2: { name: "PACKAGE B : THE FINEST", details: ["สำหรับงานแต่งแบบพิเศษ", "มีบริการครบครัน", "ระบบเสียงและแสง"] },
        w3: { name: "PACKAGE C : THE TOTAL LOOK", details: ["จัดงานครบวงจร", "ทีม Organizer", "บริการ VARAVELA"] },
        w4: { name: "PACKAGE D : THE ELEGANCE", details: ["ตกแต่งหรูหรา", "ระบบ AV พรีเมียม", "ครอบคลุมทั้งวัน"] },
        w5: { name: "PACKAGE E : THE PRESTIGE", details: ["หรูหราสุดขีด", "บริการครบครัน", "ครอบคลุมหลายวัน"] }
      },
      event: {
        e1: { name: "รวมตัว ไลท์", details: ["ฉากหลัง", "เสียงพื้นฐาน", "โต๊ะพิธีกร"] },
        e2: { name: "รวมตัว โปร", details: ["ฉากหลัง + เวที", "ชุดเสียง", "ผู้ประสานงาน"] }
      },
      photo: {
        p1: { name: "สตูดิโอ มินิ", details: ["1 ชม.", "รูปแต่ง 10 รูป", "แกลเลอรี่ออนไลน์"] },
        p2: { name: "สตูดิโอ พลัส", details: ["2 ชม.", "รูปแต่ง 25 รูป", "ชุดอุปกรณ์ประกอบ"] }
      }
    },
    
    // Addons
    addons: {
      wedding: {
        a1: "ซุ้มดอกไม้เสริม",
        a2: "ดนตรีสดคู่กีตาร์",
        a3: "บาร์ขนม"
      },
      event: {
        a4: "จอ LED (3 เมตร)",
        a5: "ช่างภาพสด"
      },
      photo: {
        a6: "ช่างแต่งหน้า",
        a7: "เพิ่มเวลา 1 ชม."
      }
    },
    
    // Package Card
    select: "เลือก",
    selected: "เลือกแล้ว",
    details: "รายละเอียด",
    
    // Details Input
    numberOfGuests: "จำนวนแขก",
    periodTime: "ช่วงเวลา",
    morning: "ช่วงเช้า",
    afternoon: "บ่ายเวลา",
    evening: "เต็มวัน",
    specialRequests: "ความต้องการพิเศษ",
    placeholder: "เช่น ธีมสีน้ำตาลพาสเทล, มุมอาหารเจ…",
    
    // Summary
    summary: "สรุปรายการ",
    themeText: "ธีมสีน้ำตาลพาสเทล",
    basePackage: "แพ็กเกจพื้นฐาน",
    addOns: "บริการเสริม",
    extraGuests: "แขกเพิ่มเติม",
    subtotal: "ราคาก่อน VAT",
    vat: "ราคารวม VAT (7%)",
    totalWithVat: "ราคารวม VAT (7%)",
    estimatedTotal: "ราคารวมประมาณ",
    bookInquiry: "สอบถามการจอง",
    
    // Footer
    footerText: "* นี่คือ UI ตัวอย่างคำนวณต้นทุนที่ได้แรงบันดาลใจจากเว็บไซต์อ้างอิง ออกแบบใหม่ด้วยธีมสีน้ำตาลพาสเทลมินิมอล",
    
    // Language
    language: "ภาษา",
    thai: "ไทย", 
    english: "English",
    
    // Booking Confirmation
    estimationSummary: "สรุปการคำนวณ",
    estimationDescription: "สรุปราคาสำหรับการใช้งานเดีย",
    serviceSummary: "สรุปราคาการ",
    packageType: "ค่าแพ็กเกจ",
    beforeVat: "ราคาก่อน VAT",
    totalWithVat: "ราคารวม VAT (7%)",
    priceDisclaimer: "* ราคานี้เป็นการประเมินเบื้องต้นที่อาจมีการเปลี่ยนแปลง เมื่อดำเนินการตามระบบนี้จริงขึ้นอยู่",
    submitRequest: "ส่งยื่น",
    backToEdit: "กลับไปแก้ไข",
    lineOA: "Line OA",
    quotation: "ใบประเมินราคา",
    quotationPreview: "ใบประเมินราคา (ตัวอย่าง)",
    close: "ปิด",
    downloadPdf: "ดาวน์โหลด PDF",
    quotationFilename: "ใบประเมินราคา",
    pdfGenerationError: "เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง"
  }
}

// Hook to use translations
export function useTranslations() {
  const { language } = useCalc()
  return translations[language] || translations.en
}