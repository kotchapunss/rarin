import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store";
import {
  useTranslations,
  getPackageCapacity,
  parseCapacityRange,
} from "../i18n";
import {
  getPackages,
  getAddons,
  getSettings,
  getBudget4TimeOptions,
  getAddonCategories,
} from "../data";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Page, pdfjs } from "react-pdf";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslations();
  const state = useStore();
  const { language } = state;
  const hiddenInvoiceRef = useRef();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Generate PDF blob for preview
  const generatePDFBlob = async () => {
    try {
      const element = hiddenInvoiceRef.current;

      if (!element) {
        console.error("Hidden PDF element not found");
        return null;
      }

      console.log("Starting PDF generation...");

      // Capture the element as-is (it's already rendered off-screen)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        logging: true,
        windowWidth: 794,
      });

      console.log("Canvas created:", canvas.width, "x", canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas has zero dimensions");
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * pdfWidth) / canvas.width;

      console.log(
        "PDF dimensions:",
        pdfWidth,
        "x",
        pdfHeight,
        "Image height:",
        imgHeight
      );

      // If content is too tall, scale it down to fit on one page
      if (imgHeight > pdfHeight) {
        console.log("Content too tall, scaling to fit on one page");
        const scale = pdfHeight / imgHeight;
        imgHeight = pdfHeight;
        imgWidth = imgWidth * scale;

        // Center the image horizontally if scaled down
        const xOffset = (pdfWidth - imgWidth) / 2;
        pdf.addImage(imgData, "PNG", xOffset, 0, imgWidth, imgHeight);
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      const blob = pdf.output("blob");
      console.log("PDF blob created:", blob.size, "bytes");
      return blob;
    } catch (error) {
      console.error("Error generating PDF blob:", error);
      return null;
    }
  };

  // Show PDF preview
  const showPDFPreviewModal = async () => {
    setShowPDFPreview(true);

    // Generate blob after showing modal
    const blob = await generatePDFBlob();
    if (blob) {
      // Clean up old URL if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      const url = URL.createObjectURL(blob);
      console.log("Created blob URL:", url);
      setPdfUrl(url);
    } else {
      setShowPDFPreview(false);
      alert(
        language === "th"
          ? "ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง"
          : "Failed to generate PDF. Please try again."
      );
    }
  };

  // Clean up blob URL when component unmounts or PDF changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const generatePDF = async () => {
    try {
      console.log("Starting PDF download...");

      // If we already have a PDF blob URL from preview, just download it
      if (pdfUrl) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${
          t.quotationFilename || "ใบประเมินราคา"
        }-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("PDF downloaded successfully from existing preview");
        return;
      }

      // Otherwise generate new blob
      const blob = await generatePDFBlob();

      if (!blob) {
        alert(
          t.pdfGenerationError || "ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        t.quotationFilename || "ใบประเมินราคา"
      }-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("PDF generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error details:", error.message, error.stack);
      alert(
        t.pdfGenerationError ||
          "เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  const calculateTotal = () => {
    // Use the same calculation rules as Summary.calcTotal to ensure consistent totals
    const selectedPackage = getPackages(state.type).find(
      (p) => p.id === state.packageId
    );
    const settings = getSettings();
    const budget4TimeOptions = getBudget4TimeOptions();

    // Calculate base price based on package type and day type
    let basePrice = 0;
    if (selectedPackage) {
      // Check if package has weekday/weekend specific pricing (for event packages)
      if (
        selectedPackage.weekdayPrice !== undefined &&
        selectedPackage.weekendPrice !== undefined
      ) {
        basePrice =
          state.dayType === "weekday"
            ? selectedPackage.weekdayPrice
            : selectedPackage.weekendPrice;
      } else {
        basePrice = selectedPackage.price;
      }
    }

    // Separate positive addons from negative (discounts)
    const positiveAddons = Object.values(state.addons || {}).reduce(
      (acc, v) => {
        const n = typeof v === "number" ? v : Number(v) || 0;
        return acc + (n > 0 ? n : 0);
      },
      0
    );

    const marketingDiscounts = Object.values(state.addons || {}).reduce(
      (acc, v) => {
        const n = typeof v === "number" ? v : Number(v) || 0;
        return acc + (n < 0 ? n : 0);
      },
      0
    );

    const addonsSum = positiveAddons + marketingDiscounts;

    // Calculate extra guest charges based on package capacity
    let extraGuestsCost = 0;
    let extraGuestsCount = 0;
    let extraGuestUnitPrice = 0;

    if (selectedPackage && state.people > 0) {
      // Get package capacity
      const capacityString = getPackageCapacity(
        state.type,
        state.packageId,
        language
      );
      const { max: maxCapacity } = parseCapacityRange(capacityString);

      // Calculate extra guests if current guest count exceeds max capacity
      if (state.people > maxCapacity) {
        extraGuestsCount = state.people - maxCapacity;

        // Find selected food addon to get price per person
        const configAddons = getAddonCategories(state.type);
        let foodAddonPrice = 0;

        // Look through all addon categories to find selected food items
        if (configAddons) {
          Object.values(configAddons).forEach((category) => {
            if (category.items) {
              category.items.forEach((item) => {
                // Check if this addon is selected and is a per_person food item
                const addonValue = state.addons?.[item.id];
                if (
                  addonValue &&
                  addonValue > 0 &&
                  (item.type === "per_person" || item.type === "auto")
                ) {
                  // Use this food item's price as the extra guest price
                  if (item.price > foodAddonPrice) {
                    foodAddonPrice = item.price;
                  }
                }
              });
            }
          });
        }

        // If no food addon selected, use default price from settings
        extraGuestUnitPrice =
          foodAddonPrice > 0 ? foodAddonPrice : settings.extraGuestPrice;
        extraGuestsCost = extraGuestsCount * extraGuestUnitPrice;
      }
    }

    // Time surcharge logic
    let timeSurcharge = 0;
    let timeSurchargeLabel = "";

    if (selectedPackage?.budgetId === "budget4") {
      const selectedTimeOption = budget4TimeOptions.find(
        (option) => option.value === state.period
      );
      if (selectedTimeOption && selectedTimeOption.surcharge > 0) {
        timeSurcharge = selectedTimeOption.surcharge;
        if (selectedTimeOption.value === "afternoon") {
          timeSurchargeLabel = "ค่าบริการครึ่งวันบ่าย";
        } else if (selectedTimeOption.value === "full_day") {
          timeSurchargeLabel = "ค่าบริการเต็มวัน";
        }
      }
    } else {
      timeSurcharge =
        state.period &&
        (state.period.includes("Full Day") || state.period.includes("เต็มวัน"))
          ? settings.fullDaySurcharge
          : 0;
      if (timeSurcharge > 0) timeSurchargeLabel = "ค่าบริการเต็มวัน";
    }

    // Subtotal before discounts
    const subtotalBeforeDiscounts =
      basePrice + addonsSum + extraGuestsCost + timeSurcharge;

    // Weekday discounts
    let weekdayDiscount = 0;
    let weekdayDiscountLabel = "";
    if (state.dayType === "weekday") {
      if (selectedPackage?.budgetId === "budget4") {
        weekdayDiscount = settings.budget4WeekdayDiscount;
        weekdayDiscountLabel = "ส่วนลดวันธรรมดา (฿40,000)";
      } else if (selectedPackage?.weekdayDiscountEligible === true) {
        weekdayDiscount = settings.weekdayDiscount;
        weekdayDiscountLabel = "ส่วนลดวันธรรมดา (฿20,000)";
      }
    }

    const totalDiscounts = weekdayDiscount + Math.abs(marketingDiscounts);

    const subtotal = subtotalBeforeDiscounts - totalDiscounts;

    const vat = Math.round(subtotal * settings.vatRate);
    const total = subtotal + vat;

    return {
      basePrice,
      addonsTotal: positiveAddons, // positive addon sum (for display if needed)
      extraGuestsCost,
      extraGuestsCount,
      extraGuestUnitPrice,
      subtotal,
      vat,
      total,
      weekdayDiscount,
      weekdayDiscountLabel,
      isEligibleForDiscount:
        selectedPackage?.budgetId === "budget4" ||
        selectedPackage?.weekdayDiscountEligible === true,
      selectedPackage,
      timeSurcharge,
      timeSurchargeLabel,
      subtotalBeforeDiscounts,
      marketingDiscounts,
    };
  };

  const {
    basePrice,
    addonsTotal,
    extraGuestsCost,
    extraGuestsCount,
    extraGuestUnitPrice,
    subtotal,
    vat,
    total,
    weekdayDiscount,
    weekdayDiscountLabel,
    isEligibleForDiscount,
    selectedPackage,
    timeSurcharge,
    timeSurchargeLabel,
    marketingDiscounts,
    subtotalBeforeDiscounts,
  } = calculateTotal();

  // Get package name in correct language
  const getPackageName = () => {
    if (!selectedPackage) return "ไม่ได้เลือกแพ็กเกจ";
    if (typeof selectedPackage.name === "object") {
      return (
        selectedPackage.name[language] ||
        selectedPackage.name.th ||
        selectedPackage.name.en ||
        "ไม่ได้เลือกแพ็กเกจ"
      );
    }
    return selectedPackage.name || "ไม่ได้เลือกแพ็กเกจ";
  };

  // Get maximum capacity for the selected package
  const getMaxCapacity = () => {
    if (!selectedPackage) return 0;
    const capacityString = getPackageCapacity(
      state.type,
      state.packageId,
      language
    );
    const { max } = parseCapacityRange(capacityString);
    return max;
  };

  // Get selected addon details for display (similar to Summary.jsx)
  const selectedAddons = React.useMemo(() => {
    const addonsList = [];

    if (state.type === "wedding") {
      // Custom services for wedding packages (matching Summary.jsx)
      const customServices = {
        // Ceremony Services
        engagement_ceremony: {
          name: { th: "พิธีหมั้น", en: "Engagement Ceremony" },
        },
        tea_ceremony: { name: { th: "พิธียกน้ำชา", en: "Tea Ceremony" } },
        water_blessing: {
          name: { th: "พิธีรดน้ำสังข์", en: "Water Blessing Ceremony" },
        },
        monk_blessing: {
          name: { th: "พิธีสงฆ์", en: "Monk Blessing Ceremony" },
        },
        vow_ceremony: { name: { th: "พิธีสาบาน", en: "Vow Ceremony" } },

        // Food & Beverage
        classic_thai_buffet: {
          name: { th: "Classic Thai Buffet", en: "Classic Thai Buffet" },
        },
        deluxe_international_buffet: {
          name: {
            th: "Deluxe International Buffet",
            en: "Deluxe International Buffet",
          },
        },
        delight_cocktail: {
          name: { th: "Delight Cocktail", en: "Delight Cocktail" },
        },
        stylish_heavy_cocktail: {
          name: { th: "Stylish Heavy Cocktail", en: "Stylish Heavy Cocktail" },
        },
        classic_chinese_table: {
          name: { th: "Classic Chinese Table", en: "Classic Chinese Table" },
        },
        deluxe_chinese_table: {
          name: { th: "Deluxe Chinese Table", en: "Deluxe Chinese Table" },
        },
        stylish_international_buffet: {
          name: {
            th: "Stylish International Buffet",
            en: "Stylish International Buffet",
          },
        },
        western_thai_course_menu: {
          name: {
            th: "5 Western / Thai Course Menu",
            en: "5 Western / Thai Course Menu",
          },
        },

        // Liquor
        beer_singha: { name: { th: "เบียร์สิงห์", en: "Singha Beer" } },
        beer_asahi: { name: { th: "เบียร์อาซาฮี", en: "Asahi Beer" } },
        wine_house: { name: { th: "ไวน์ House Wine", en: "House Wine" } },

        // Marketing Discounts
        collab_program: {
          name: { th: "โปรแกรม Couple Collab", en: "Couple Collab Program" },
        },
        social_media_collab: {
          name: { th: "ร่วมโปรโมททางการตลาดกับลลิล", en: "Co-Marketing" },
        },
      };

      // Iterate known service keys and include only non-zero numeric values
      Object.keys(customServices).forEach((addonId) => {
        const raw = state.addons?.[addonId];
        const value = typeof raw === "number" ? raw : raw ? Number(raw) : 0;
        if (!customServices[addonId]) return;
        if (value === 0 || Number.isNaN(value)) return;

        // For alcoholic beverages we require positive values to show
        if (
          ["beer_singha", "beer_asahi", "wine_house"].includes(addonId) &&
          value <= 0
        )
          return;

        const service = customServices[addonId];
        const serviceName =
          typeof service.name === "object"
            ? service.name[language] || service.name.th || service.name.en || ""
            : service.name || "";

        addonsList.push({
          id: addonId,
          name: serviceName,
          totalPrice: value,
          quantity: 1,
          unitPrice: value,
        });
      });
    } else {
      // For event and photo types, get addons from config
      const configAddons = getAddonCategories(state.type);

      // Flatten all addon items from all categories
      const allConfigAddons = {};
      Object.values(configAddons).forEach((category) => {
        if (category.items) {
          category.items.forEach((item) => {
            allConfigAddons[item.id] = item;
          });
        }
      });

      // Process selected addons
      Object.entries(state.addons || {}).forEach(([addonId, storedValue]) => {
        const addon = allConfigAddons[addonId];
        if (!addon) return;

        const value =
          typeof storedValue === "number"
            ? storedValue
            : Number(storedValue) || 0;
        if (value === 0 || Number.isNaN(value)) return;

        // Get addon name from translations first, fallback to config
        let addonName = "";
        if (t.addons?.[state.type]?.items?.[addonId]?.name) {
          addonName = t.addons[state.type].items[addonId].name;
        } else if (typeof addon.name === "object") {
          addonName =
            addon.name[language] || addon.name.th || addon.name.en || "";
        } else {
          addonName = addon.name || "";
        }

        // Calculate quantity for display
        let quantity = 1;
        let unitPrice = addon.price || 0;

        if (
          addon.type === "per_person" ||
          addon.type === "auto" ||
          addon.type === "grid"
        ) {
          // People-based calculation
          quantity = state.people || 1;
          // Check if it's a table-based addon (10 people per unit)
          const unitText =
            typeof addon.unit === "object"
              ? addon.unit[language] || addon.unit.th || addon.unit.en || ""
              : addon.unit || "";
          if (
            unitText === "โต๊ะ" ||
            unitText === "table" ||
            unitText === "10 ท่าน" ||
            unitText === "10 people"
          ) {
            quantity = Math.ceil((state.people || 1) / 10);
          }
        } else if (
          addon.type === "input" ||
          addon.type === "per_bottle" ||
          addon.type === "per_package"
        ) {
          // Quantity-based: calculate from stored value and unit price
          if (unitPrice > 0) {
            quantity = Math.max(1, Math.round(Math.abs(value) / unitPrice));
          }
        }

        addonsList.push({
          id: addonId,
          name: addonName,
          totalPrice: value,
          quantity: quantity,
          unitPrice: unitPrice,
        });
      });
    }

    return addonsList;
  }, [state.addons, language, state.type, state.people, t.addons]);

  // Prepare addon groups for display: positive addons and marketing discounts
  const positiveSelectedAddons = selectedAddons.filter((a) => a.totalPrice > 0);
  const negativeSelectedAddons = selectedAddons.filter((a) => a.totalPrice < 0);
  const marketingDiscountsAbs = Math.abs(marketingDiscounts || 0);
  const totalDiscounts = (weekdayDiscount || 0) + marketingDiscountsAbs;

  // Don't show PDF preview, show the main summary
  // Show PDF preview modal
  if (showPDFPreview) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {language === "th"
                ? "ใบประเมินราคา (ตัวอย่าง)"
                : "Estimated Cost Summary (Preview)"}
            </h2>
            <button
              onClick={() => {
                setShowPDFPreview(false);
                if (pdfUrl) {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                }
                setNumPages(null);
                setPageNumber(1);
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* PDF Preview Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {pdfUrl ? (
              <div className="flex flex-col items-center">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <div className="text-gray-500">
                        {language === "th" ? "กำลังโหลด..." : "Loading..."}
                      </div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center p-8">
                      <div className="text-red-500">
                        {language === "th"
                          ? "ไม่สามารถโหลด PDF ได้"
                          : "Failed to load PDF"}
                      </div>
                    </div>
                  }
                  className="shadow-lg"
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} className="mb-4">
                      <Page
                        pageNumber={index + 1}
                        width={794}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-md"
                      />
                    </div>
                  ))}
                </Document>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">
                  {language === "th"
                    ? "กำลังสร้าง PDF..."
                    : "Generating PDF..."}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-600">
              {numPages &&
                `${language === "th" ? "จำนวนหน้า" : "Pages"}: ${numPages}`}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPDFPreview(false);
                  if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                    setPdfUrl(null);
                  }
                  setNumPages(null);
                  setPageNumber(1);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {language === "th" ? "ปิด" : "Close"}
              </button>
              <button
                onClick={generatePDF}
                className="px-6 py-2 bg-[#B8846B] text-white rounded-lg hover:bg-[#A0735A] transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {language === "th" ? "ดาวน์โหลด PDF" : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main booking confirmation page with hidden PDF template
  return (
    <>
      {/* Hidden PDF Template - Always rendered */}
      <div
        ref={hiddenInvoiceRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          display: "block",
          width: "794px",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          lineHeight: "1.4",
          color: "#000000",
        }}
      >
        <div style={{ padding: "40px", width: "794px", minHeight: "1123px" }}>
          {/* PDF Header */}
          <div
            style={{
              backgroundColor: "#4e4e3d",
              color: "white",
              padding: "20px",
              borderRadius: "8px 8px 0 0",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "5px",
                    margin: "0 0 5px 0",
                  }}
                >
                  ใบประเมินราคาเบื้องต้น
                </h2>
                <p style={{ fontSize: "14px", opacity: "0.9", margin: "0" }}>
                  Estimated Cost Summary
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <img
                  src="/logo-rarin.png"
                  alt="Rarin Logo"
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              marginBottom: "30px",
            }}
          >
            <div>
              <h3
                style={{
                  fontWeight: "bold",
                  marginBottom: "15px",
                  margin: "0 0 15px 0",
                }}
              >
                Contact Information
              </h3>
              <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
                <div>
                  <strong>Tel:</strong> ({state.details?.tel || "ยังไม่ระบุ"})
                </div>
                <div>
                  <strong>Email:</strong> (
                  {state.details?.email || "ยังไม่ระบุ"})
                </div>
                <div>
                  <strong>Line ID:</strong> (
                  {state.details?.lineId || "ยังไม่ระบุ"})
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                <div>
                  เลขที่: RARIN-{new Date().getFullYear()}
                  {String(new Date().getMonth() + 1).padStart(2, "0")}
                  {String(new Date().getDate()).padStart(2, "0")}-
                  {String(new Date().getHours()).padStart(2, "0")}
                  {String(new Date().getMinutes()).padStart(2, "0")}
                </div>
                <div>วันที่: {new Date().toLocaleDateString("th-TH")}</div>
                <div style={{ color: "#B8846B", fontWeight: "bold" }}>ร่าง</div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              marginBottom: "30px",
            }}
          >
            {/* Left side - Customer Contact */}
            <div>
              <h3
                style={{
                  fontWeight: "bold",
                  marginBottom: "1px",
                  paddingBottom: "1px",
                }}
              >
                ผู้ติดต่อ:
              </h3>
              <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
                <div>
                  <strong>ระริณ ริเวอร์ไซต์</strong>
                </div>
                <div>เลขที่ 438 ซอย เอบวงศ์ 111 แยก 15</div>
                <div>แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260</div>
                <div>
                  <strong>ความต้องการพิเศษ:</strong> {state.notes || "-"}
                </div>
              </div>
            </div>

            {/* Right side - Order Information */}
            <div>
              <h3
                style={{
                  textAlign: "right",
                }}
              >
                <strong>เลขประจำตัว:</strong>
              </h3>
              <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div>DID0555581670</div>
                  <strong>ติดต่อ:</strong>
                  <div>029464626</div>
                  <div>hello@rarin.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "30px",
              border: "1px solid #f2efefff",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #f2efefff",
                  backgroundColor: "#f2efefff",
                }}
              >
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  รหัส
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  รายการสินค้า
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  จำนวน
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "right",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  ราคา/หน่วย
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "right",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  รวมเป็นเงิน
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f2efefff" }}>
                <td style={{ padding: "12px 8px", fontSize: "12px" }}>001</td>
                <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                  {getPackageName()}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  1
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {basePrice.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {basePrice.toLocaleString()}
                </td>
              </tr>
              {selectedAddons.map((addon, index) => (
                <tr
                  key={addon.id}
                  style={{ borderBottom: "1px solid #f2efefff" }}
                >
                  <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                    {String(index + 2).padStart(3, "0")}
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                    {addon.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {addon.quantity}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                    }}
                  >
                    {(addon.totalPrice < 0
                      ? addon.totalPrice
                      : addon.unitPrice
                    ).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                    }}
                  >
                    {addon.totalPrice.toLocaleString()}
                  </td>
                </tr>
              ))}
              {timeSurcharge > 0 && (
                <tr style={{ borderBottom: "1px solid #f2efefff" }}>
                  <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                    {String(selectedAddons.length + 2).padStart(3, "0")}
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                    {timeSurchargeLabel}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    1
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                    }}
                  >
                    {timeSurcharge.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                    }}
                  >
                    {timeSurcharge.toLocaleString()}
                  </td>
                </tr>
              )}
              {extraGuestsCost > 0 && (
                <tr style={{ borderBottom: "1px solid #f2efefff" }}>
                  <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                    {String(
                      selectedAddons.length + (timeSurcharge > 0 ? 3 : 2)
                    ).padStart(3, "0")}
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                    แขกเพิ่มเติม ({extraGuestsCount} ท่าน)
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {extraGuestsCount}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                    }}
                  >
                    {extraGuestUnitPrice.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                    }}
                  >
                    {extraGuestsCost.toLocaleString()}
                  </td>
                </tr>
              )}
              {weekdayDiscount > 0 && (
                <tr style={{ borderBottom: "1px solid #f2efefff" }}>
                  <td style={{ padding: "12px 8px", fontSize: "12px" }}>
                    {String(
                      selectedAddons.length +
                        (extraGuestsCost > 0 ? 1 : 0) +
                        (timeSurcharge > 0 ? 1 : 0) +
                        2
                    ).padStart(3, "0")}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      fontSize: "12px",
                      color: "#B8846B",
                    }}
                  >
                    {weekdayDiscountLabel}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    1
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                      color: "#B8846B",
                    }}
                  >
                    -{weekdayDiscount.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      fontSize: "12px",
                      color: "#B8846B",
                    }}
                  >
                    -{weekdayDiscount.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Notes and Totals */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
            }}
          >
            <div>
              <h4
                style={{
                  fontWeight: "bold",
                  marginBottom: "15px",
                  margin: "0 0 15px 0",
                }}
              >
                หมายเหตุ:
              </h4>

              <div
                style={{ fontSize: "12px", color: "#444", lineHeight: "1.6" }}
              >
                {state.people > 0 && <div>จำนวนแขก: {state.people} ท่าน</div>}
                <div>
                  ช่วงเวลา:{" "}
                  {state.period === "morning"
                    ? "ช่วงเช้า"
                    : state.period === "afternoon"
                    ? "บ่ายเวลา"
                    : "เต็มวัน"}
                </div>
                <div>
                  ประเภทวัน:{" "}
                  {state.dayType === "weekday"
                    ? "วันธรรมดา"
                    : "วันหยุดสุดสัปดาห์"}
                </div>
                <div>
                  ประเภท:{" "}
                  {state.type === "wedding"
                    ? "งานแต่งงาน"
                    : state.type === "event"
                    ? "งานอีเวนต์"
                    : "ถ่ายภาพ"}
                </div>

                <p>ราคานี้เป็นราคาประเมินเบื้องต้น และอาจมีการเปลี่ยนแปลง</p>
                <p>และอาจมีการเปลี่ยนแปลงข้อมูลแนบ</p>
              </div>
            </div>
            <div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    fontSize: "12px",
                  }}
                >
                  <span>ราคารวมก่อนบวก</span>
                  <span style={{ fontWeight: "bold" }}>
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    fontSize: "12px",
                  }}
                >
                  <span>ภาษีมูลค่าเพิ่ม 7%</span>
                  <span style={{ fontWeight: "bold" }}>
                    ฿{vat.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #ccc",
                    paddingTop: "10px",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    <span>ราคารวมสุทธิ</span>
                    <span style={{ color: "#B8846B" }}>
                      ฿{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "40px",
              fontSize: "10px",
              color: "#666",
              textAlign: "center",
            }}
          >
            เพื่อความถูกต้อง กรุณาใช้เบราว์เซอร์ Chrome หรือ Safari
          </div>
        </div>
      </div>

      {/* Main booking confirmation page */}
      <div className="min-h-screen bg-gray-100 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/rarin-pic2.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay to ensure readability */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        {/* Main Card */}
        <div className="max-w-2xl mx-auto p-4 relative z-10">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header Background */}
            <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/rarin-pic3.png"
                  alt="Rarin Background"
                  className="w-full h-full object-cover opacity-65"
                />
              </div>
              {/* Rarin Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-[#B8846B] text-4xl font-bold"
                  style={{ fontFamily: "cursive" }}
                >
                  Rarin
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
                  <span>📧 hello@rarin.com</span>
                </div>
                <div className="flex items-center justify-center">
                  <span>💬 Line Official: @rarin</span>
                </div>
                <div className="flex items-center justify-center text-center">
                  <span>
                    🕒 Office Time 10:00-19:00
                    <br />
                    Monday - Sunday
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {t.estimationSummary || "สรุปการคำนวณ"}
                </h1>
                <p className="text-gray-600">
                  {t.estimationDescription || "สรุปราคาสำหรับการใช้งานเดีย"}
                </p>
              </div>

              {/* Package Summary */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {t.serviceSummary || "สรุปราคาการ"}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {/* Package Details with Capacity */}
                  <div className="mb-3 border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span>
                        {t.packageType || "ค่าแพ็กเกจ"} ({getPackageName()})
                      </span>
                      <span className="font-semibold">
                        ฿{basePrice.toLocaleString()}
                      </span>
                    </div>
                    {selectedPackage && state.people > 0 && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>
                      
                          {language === "th"
                            ? "จำนวนแขก: "
                            : "Number of guests: "}
                          <span className="font-medium text-gray-700">
                            {state.people}{" "}
                            {language === "th" ? "ท่าน" : "people"}
                          </span>
                        </div>

                        {/*show this section when  number of guests is greater than max capacity*/}
                        {state.people > getMaxCapacity() && (
                          <div>
                            {language === "th"
                              ? "รองรับสูงสุด: "
                              : "Max capacity: "}
                            <span className="font-medium text-gray-700">
                              {getMaxCapacity()}{" "}
                              {language === "th" ? "ท่าน" : "people"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {positiveSelectedAddons.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="text-sm text-gray-600 mb-2">
                        บริการเสริม:
                      </div>
                      {positiveSelectedAddons.map((addon, index) => (
                        <div
                          key={addon.id}
                          className="flex justify-between items-center text-sm mb-1"
                        >
                          <span>
                            • {addon.name}
                            {addon.quantity > 1 ? ` × ${addon.quantity}` : ""}
                          </span>
                          <span>฿{addon.totalPrice.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discounts Section (marketing discounts + weekday discount) */}
                  {(negativeSelectedAddons.length > 0 ||
                    weekdayDiscount > 0) && (
                    <div className="border-t">
                      <div className="font-medium text-[#B8846B] mt-2">
                        {language === "th"
                          ? "ส่วนลดทั้งหมด"
                          : "Total Discounts"}
                      </div>
                      {negativeSelectedAddons.map((addon, index) => (
                        <div
                          key={addon.id}
                          className="flex justify-between text-sm ml-4 text-[#B8846B]"
                        >
                          <span>• {addon.name}</span>
                          <span>
                            -฿{Math.abs(addon.totalPrice).toLocaleString()}
                          </span>
                        </div>
                      ))}

                      {weekdayDiscount > 0 && (
                        <div className="flex justify-between text-sm ml-4 text-[#B8846B]">
                          <span>• {weekdayDiscountLabel}</span>
                          <span>-฿{weekdayDiscount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-[#B8846B] font-medium ml-4">
                          <span>
                            {language === "th" ? "รวมส่วนลด" : "Total Discount"}
                          </span>
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
                        <span>
                          แขกเพิ่มเติม ({extraGuestsCount} ท่าน × ฿
                          {extraGuestUnitPrice.toLocaleString()})
                        </span>
                        <span>฿{extraGuestsCost.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-300 pt-6 mb-8">
                <div className="flex justify-between text-lg mb-2">
                  <span>{t.beforeVat || "ราคาก่อน VAT"}</span>
                  <span className="font-semibold">
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#B8846B] mb-4">
                  <span>{t.totalWithVat || "ราคารวม VAT (7%)"}</span>
                  <span>฿{total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {t.priceDisclaimer ||
                    "* ราคานี้เป็นการประเมินเบื้องต้นที่อาจมีการเปลี่ยนแปลง เมื่อดำเนินการตามระบบนี้จริงขึ้นอยู่"}
                </p>
              </div>

              {/* Main Action Button */}
              <button className="w-full bg-[#B8846B] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#A0735A] transition-colors mb-4">
                {t.submitRequest || "ส่งยื่น"}
              </button>

              {/* Bottom Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors"
                >
                  {t.backToEdit || "กลับไปแก้ไข"}
                </button>
                <button className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors">
                  {t.lineOA || "Line OA"}
                </button>
                <button
                  onClick={showPDFPreviewModal}
                  className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors"
                >
                  {t.quotation || "ใบประเมินราคา"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
