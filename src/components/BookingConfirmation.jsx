import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store";
import {
  useTranslations,
  getTranslation,
  getPackageCapacity,
  parseCapacityRange,
} from "../i18n";
import LanguageToggle from "./LanguageToggle";
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
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../../emailjs-config';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// EmailJS Configuration from config file
const { serviceId: EMAILJS_SERVICE_ID, templateId: EMAILJS_TEMPLATE_ID, publicKey: EMAILJS_PUBLIC_KEY } = EMAILJS_CONFIG;

// Initialize EmailJS with error handling
try {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized successfully');
} catch (error) {
  console.error('Failed to initialize EmailJS:', error);
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslations();
  const state = useStore();
  const { language } = state;
  const hiddenInvoiceRef = useRef();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfImageData, setPdfImageData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    email: '',
    phone: '',
    lineId: '',
    date: '',
    specialRequest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    tel: '',
    email: ''
  });

  // Fallback simple PDF generation without html2canvas
  const generateSimplePDF = () => {
    try {
      console.log("=== Generating simple PDF fallback ===");
      const pdf = new jsPDF("p", "mm", "a4");

      // Set font
      pdf.setFont("helvetica", "normal");

      // Header
      pdf.setFontSize(16);
      pdf.text("Rarin - Estimated Cost Summary", 20, 20);

      // Package info
      pdf.setFontSize(12);
      let yPos = 40;

      pdf.text(`Service Type: ${state.type}`, 20, yPos);
      yPos += 10;
      pdf.text(`Package: ${getPackageName()}`, 20, yPos);
      yPos += 10;
      pdf.text(`Guests: ${state.people} people`, 20, yPos);
      yPos += 10;
      pdf.text(`Day Type: ${state.dayType}`, 20, yPos);
      yPos += 10;
      pdf.text(`Period: ${state.period}`, 20, yPos);
      yPos += 20;

      // Total
      pdf.setFontSize(14);
      pdf.text(`Total: ฿${total.toLocaleString()}`, 20, yPos);
      yPos += 10;
      pdf.text(`VAT: ฿${vat.toLocaleString()}`, 20, yPos);
      yPos += 10;
      pdf.text(`Subtotal: ฿${subtotal.toLocaleString()}`, 20, yPos);

      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating simple PDF:", error);
      return null;
    }
  };

  // Generate PDF blob for preview (exact A4 match at 2x scale -> 1588x2246 px)
  const generatePDFBlob = async () => {
    try {
      console.log("=== Starting PDF generation (A4 exact) ===");

      const source = hiddenInvoiceRef.current;
      if (!source) {
        console.error("Hidden PDF element not found");
        throw new Error("PDF template element not found");
      }

      // Fixed A4 size at 96 DPI in CSS pixels
      const A4_WIDTH_PX = 794; // ~8.27in * 96dpi
      const A4_HEIGHT_PX = 1123; // ~11.69in * 96dpi
      const SCALE = 2; // produce 1588x2246 to match prior PDF

      // Clone the template so we can control layout/styling without touching UI
      const clone = source.cloneNode(true);
      // Ensure clone is visible and sized exactly to A4
      clone.style.position = "fixed";
      clone.style.left = "-10000px";
      clone.style.top = "0";
      clone.style.width = `${A4_WIDTH_PX}px`;
      clone.style.minHeight = `${A4_HEIGHT_PX}px`;
      clone.style.maxWidth = `${A4_WIDTH_PX}px`;
      clone.style.opacity = "1";
      clone.style.visibility = "visible";
      clone.style.display = "block";
      clone.style.transform = "none";
      clone.style.background = "#ffffff";
      clone.setAttribute("data-render-for", "pdf");

      // Attempt to inline logo as base64 for guaranteed appearance
      try {
        const logoPath = "/RARIN-white-logo.png"; // public asset
        const resp = await fetch(logoPath, { cache: "force-cache" });
        if (resp.ok) {
          const blobLogo = await resp.blob();
          const logoDataUrl = await new Promise((resolve) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.readAsDataURL(blobLogo);
          });
          const logoImg = clone.querySelector('img[alt="Rarin Logo"]');
          if (logoImg) {
            logoImg.src = logoDataUrl; // replace with inline base64
            logoImg.removeAttribute('crossorigin');
          }
        } else {
          console.warn("Logo fetch failed status", resp.status);
        }
      } catch (logoErr) {
        console.warn("Logo inline failed", logoErr);
      }

      // Append to DOM so styles (Tailwind, fonts) apply
      document.body.appendChild(clone);

      // Wait for images inside the clone
      const images = clone.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            const done = () => resolve();
            img.onload = done;
            img.onerror = done;
            setTimeout(done, 5000); // timeout safeguard
          })
        )
      );

      // Small settle wait to ensure final layout
      await new Promise((r) => setTimeout(r, 150));

      console.log("Capturing clone via html2canvas...", {
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        scale: SCALE,
      });

      const canvas = await html2canvas(clone, {
        scale: SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
        logging: false,
        removeContainer: true,
      });

      // Clean up the clone
      document.body.removeChild(clone);

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Failed to capture content - canvas is empty");
      }

      console.log("✓ Canvas created:", canvas.width, "x", canvas.height);

      // To match the reference, embed full-bleed on a single A4 page
      const imgData = canvas.toDataURL("image/png", 0.94);
      if (!imgData || imgData === "data:,") {
        throw new Error("Failed to create canvas image data");
      }

      // Save image for preview to guarantee parity with downloaded file
      setPdfImageData(imgData);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const blob = pdf.output("blob");
      console.log("✓ PDF blob created successfully:", blob.size, "bytes");
      return blob;
    } catch (error) {
      console.error("=== PDF generation failed ===", error);
      // Try fallback simple PDF generation
      try {
        const fallbackBlob = generateSimplePDF();
        if (fallbackBlob) return fallbackBlob;
      } catch (_) { }
      throw error;
    }
  };

  // Show PDF preview
  const showPDFPreviewModal = async () => {
    try {
      if (!isComponentReady) {
        const waitMessage = language === "th"
          ? "กรุณารอสักครู่ กำลังเตรียมข้อมูล..."
          : "Please wait, preparing data...";
        alert(waitMessage);
        return;
      }

      // Ensure no other modals are open
      setShowSubmitModal(false);

      console.log("=== Starting PDF preview modal ===");
      setShowPDFPreview(true);
      setPdfUrl(null); // Clear previous PDF first

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("PDF generation timeout (30 seconds)"));
        }, 30000); // 30 second timeout
      });

      // Generate blob after showing modal with timeout
      const blob = await Promise.race([
        generatePDFBlob(),
        timeoutPromise
      ]);

      if (blob) {
        // Clean up old URL if exists
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
        const url = URL.createObjectURL(blob);
        console.log("✓ Created blob URL:", url);
        setPdfUrl(url);
        console.log("=== PDF preview modal completed successfully ===");
      } else {
        throw new Error("Failed to generate PDF blob");
      }
    } catch (error) {
      console.error("=== PDF preview modal failed ===");
      console.error("Error in showPDFPreviewModal:", error);
      setShowPDFPreview(false);

      const errorMessage = language === "th"
        ? `ไม่สามารถสร้าง PDF ได้: ${error.message || "กรุณาลองใหม่อีกครั้ง"}`
        : `Failed to generate PDF: ${error.message || "Please try again."}`;

      alert(errorMessage);
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

  // Ensure component is ready for PDF generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentReady(true);
    }, 1000); // Wait 1 second for component to be fully ready

    return () => clearTimeout(timer);
  }, []);

  const generatePDF = async () => {
    try {
      console.log("Starting PDF download...");

      // If we already have a PDF blob URL from preview, just download it
      if (pdfUrl) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${t.quotationFilename || "ใบประเมินราคา"
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
        throw new Error("Failed to generate PDF blob");
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${t.quotationFilename || "ใบประเมินราคา"
        }-${Date.now().toString}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("PDF generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error details:", error.message, error.stack);

      const errorMessage = language === "th"
        ? `ไม่สามารถสร้าง PDF ได้: ${error.message || "กรุณาลองใหม่อีกครั้ง"}`
        : `Failed to generate PDF: ${error.message || "Please try again."}`;

      alert(errorMessage);
    }
  };

  // Handle submit request modal
  const handleSubmitRequest = () => {
    // Ensure no other modals are open
    setShowPDFPreview(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    setShowSubmitModal(true);
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setSubmitForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission with email
  const handleFormSubmit = async () => {
    // Validate required fields
    if (!submitForm.email || !submitForm.phone) {
      alert(language === 'th' ? 'กรุณากรอกอีเมลและเบอร์โทรศัพท์' : 'Please fill in email and phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Starting form submission...');

      // Generate PDF blob
      console.log('Generating PDF blob...');
      let pdfBlob = null;
      let pdfBase64 = null;

      try {
        pdfBlob = await generatePDFBlob();
        if (pdfBlob) {
          console.log('PDF blob generated successfully:', pdfBlob.size, 'bytes');

          // Convert blob to base64 for EmailJS
          const reader = new FileReader();
          pdfBase64 = await new Promise((resolve, reject) => {
            reader.onload = () => {
              const base64 = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
              console.log('PDF converted to base64, length:', base64.length);
              resolve(base64);
            };
            reader.onerror = (error) => {
              console.error('FileReader error:', error);
              reject(error);
            };
            reader.readAsDataURL(pdfBlob);
          });
          console.log('PDF converted to base64 successfully');
        } else {
          console.warn('PDF generation returned null');
        }
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        console.warn('Continuing form submission without PDF attachment');
      }

      // Prepare email data
      const emailData = {
        to_email: EMAILJS_CONFIG.targetEmail,
        to_name: 'Rarin Team',
        from_name: submitForm.email,
        customer_email: submitForm.email,
        customer_phone: submitForm.phone,
        customer_line_id: submitForm.lineId || '-',
        event_date: submitForm.date || '-',
        special_request: submitForm.specialRequest || 'None',

        // Booking details (English only for EmailJS compatibility)
        service_type: state.type === 'wedding' ? 'Wedding' : state.type === 'event' ? 'Event' : 'Photo Shoot',
        package_name: getPackageName(),
        guest_count: state.people,
        day_type: state.dayType === 'weekday' ? 'Weekday' : 'Weekend/Holiday',
        period: state.period,
        total_price: `${total.toLocaleString()} THB`,

        // Detailed pricing breakdown for email table
        base_price: state.type === 'event' ? '-' : `${basePrice.toLocaleString()} THB`,
        addons_total: `${(addonsTotal || 0).toLocaleString()} THB`,
        time_surcharge: timeSurcharge > 0 ? `${timeSurcharge.toLocaleString()} THB` : '-',
        extra_guests_count: extraGuestsCount > 0 ? `${extraGuestsCount} guests` : '-',
        extra_guests_cost: extraGuestsCost > 0 ? `${extraGuestsCost.toLocaleString()} THB` : '-',
        total_discounts: (weekdayDiscount + Math.abs(marketingDiscounts || 0)) > 0 ? `${(weekdayDiscount + Math.abs(marketingDiscounts || 0)).toLocaleString()} THB` : '-',
        subtotal: `${subtotal.toLocaleString()} THB`,
        vat_amount: `${vat.toLocaleString()} THB`,

        // Additional details
        booking_summary: JSON.stringify({
          type: state.type,
          packageId: state.packageId,
          people: state.people,
          dayType: state.dayType,
          period: state.period,
          addons: state.addons,
          notes: state.notes,
          calculatedTotal: total,
          selectedAddons: selectedAddons.map(addon => ({
            name: addon.name,
            price: addon.totalPrice,
            quantity: addon.quantity
          }))
        }, null, 2),

        // Email body content (keeping Thai in body as it's in a text block)
        email_body: `Booking Details from ${submitForm.email}

Contact Information:
- Email: ${submitForm.email}
- Phone: ${submitForm.phone}
- Line ID: ${submitForm.lineId || '-'}
- Event Date: ${submitForm.date || '-'}

Booking Details:
- Service: ${state.type === 'wedding' ? 'Wedding' : state.type === 'event' ? 'Event' : 'Photo Shoot'}
- Package: ${getPackageName()}
- Guests: ${state.people} people
- Day Type: ${state.dayType === 'weekday' ? 'Weekday' : 'Weekend/Holiday'}
- Period: ${state.period}
- Total: ${total.toLocaleString()} THB

Special Requests:
${submitForm.specialRequest || 'None'}

PDF Status: ${pdfBase64 ? 'PDF attached' : 'No PDF generated'}
        `
      };

      // Add PDF attachment if available
      if (pdfBase64) {
        emailData.pdf_attachment = pdfBase64;
        emailData.pdf_filename = `booking-quote-${Date.now()}.pdf`;
      }

      console.log('Sending email with EmailJS...');

      // Check if EmailJS is configured properly (updated to use actual IDs)
      if (EMAILJS_PUBLIC_KEY === 'your_public_key_here' ||
        EMAILJS_SERVICE_ID === 'service_rarin' ||
        EMAILJS_TEMPLATE_ID === 'template_rarin_booking' ||
        EMAILJS_PUBLIC_KEY === 'N0Z9CM_EdE46WDfka' ||
        EMAILJS_SERVICE_ID === 'service_8yk3ezo' ||
        EMAILJS_TEMPLATE_ID === 'template_y8ca0gi') {

        // Since we have the actual credentials now, let's log the email data for debugging
        console.log('Email data being sent:', {
          ...emailData,
          pdf_attachment: pdfBase64 ? `[PDF Base64 - ${pdfBase64.length} characters]` : 'No PDF'
        });
      }

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailData
      );

      console.log('Email sent successfully:', result);

      // Show success message
      const successMessage = language === 'th'
        ? 'ส่งข้อมูลเรียบร้อยแล้ว! '
        : 'Request submitted successfully!';

      alert(successMessage);

      setShowSubmitModal(false);
      setSubmitForm({
        email: '',
        phone: '',
        lineId: '',
        date: '',
        specialRequest: ''
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      console.error('Error details:', error.message, error.stack);

      let errorMessage = language === 'th'
        ? 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง'
        : 'Failed to send email. Please try again.';

      if (error.text) {
        errorMessage += ` (${error.text})`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    try {
      console.log("=== Calculating total ===");
      console.log("Current state:", state);

      // Use the same calculation rules as Summary.calcTotal to ensure consistent totals
      const selectedPackage = getPackages(state.type).find(
        (p) => p.id === state.packageId
      );
      console.log("Selected package:", selectedPackage);

      const settings = getSettings();
      console.log("Settings:", settings);

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

      console.log("Base price:", basePrice);

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
        if (state.type === 'wedding' && selectedPackage.budgetId !== 'budget4') {
          // For wedding type (except budget4), use food budget limits from settings
          const weddingFoodLimits = settings.weddingFoodLimits;
          const budgetLimit = weddingFoodLimits?.[selectedPackage.budgetId];

          if (budgetLimit) {
            const foodLimitGuests = budgetLimit.limitGuests;
            extraGuestUnitPrice = budgetLimit.extraGuestPrice;

            // Calculate extra guests if current guest count exceeds food limit
            if (state.people > foodLimitGuests) {
              extraGuestsCount = state.people - foodLimitGuests;
              extraGuestsCost = extraGuestsCount * extraGuestUnitPrice;
            }
          }
        } else if (state.type === 'photo' || (state.type === 'wedding' && selectedPackage.budgetId === 'budget4')) {
          // For photo types and wedding budget4 packages only, use existing capacity-based calculation
          // Event types do not have extra guest charges - they work on minimum spending model
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
        // For event types, we don't calculate extra guest charges at all
        // Event packages work on minimum spending model, not capacity + extra guest fees
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
            timeSurchargeLabel = getTranslation("afternoonSurchargeLabel", language);
          } else if (selectedTimeOption.value === "full_day") {
            timeSurchargeLabel = getTranslation("fullDaySurchargeLabel", language);
          }
        }
      } else {
        timeSurcharge =
          state.period &&
            (state.period.includes("Full Day") || state.period.includes("เต็มวัน"))
            ? settings.fullDaySurcharge
            : 0;
        if (timeSurcharge > 0) timeSurchargeLabel = getTranslation("fullDaySurchargeLabel", language);
      }

      // Calculate subtotal before discounts - different for event type
      let subtotalBeforeDiscounts;
      if (state.type === 'event') {
        // For event type, don't include base package price in calculations
        // Only show minimum spending requirement and current addon spending
        subtotalBeforeDiscounts = addonsSum + extraGuestsCost + timeSurcharge;
      } else {
        // For other types, use normal calculation
        subtotalBeforeDiscounts = basePrice + addonsSum + extraGuestsCost + timeSurcharge;
      }

      // Weekday discounts
      let weekdayDiscount = 0;
      let weekdayDiscountLabel = "";
      if (state.dayType === "weekday") {
        if (selectedPackage?.budgetId === "budget4") {
          weekdayDiscount = settings.budget4WeekdayDiscount;
          weekdayDiscountLabel = getTranslation("weekdayDiscountBudget4Label", language);
        } else if (selectedPackage?.weekdayDiscountEligible === true) {
          weekdayDiscount = settings.weekdayDiscount;
          weekdayDiscountLabel = getTranslation("weekdayDiscountLabel", language);
        }
      }

      const totalDiscounts = weekdayDiscount + Math.abs(marketingDiscounts);

      // Final subtotal after discounts (before VAT)
      let subtotal;
      if (state.type === 'event') {
        // For event type, calculate from addons only
        subtotal = subtotalBeforeDiscounts - totalDiscounts;
      } else {
        // For other types, use normal calculation
        subtotal = subtotalBeforeDiscounts - totalDiscounts;
      }

      const vat = Math.round(subtotal * settings.vatRate);
      const total = subtotal + vat;

      // Calculate minimum spending for event type
      let minimumSpending = 0;
      let currentAddonSpending = 0;
      let isMinimumMet = true;
      let shortfall = 0;

      if (state.type === 'event' && selectedPackage) {
        minimumSpending = selectedPackage.minSpend || 0;

        // Calculate current addon spending (food & beverage + alcoholic packages)
        currentAddonSpending = positiveAddons;

        // Check if minimum is met
        isMinimumMet = currentAddonSpending >= minimumSpending;
        shortfall = isMinimumMet ? 0 : minimumSpending - currentAddonSpending;
      }

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
        // Event type minimum spending data
        minimumSpending,
        currentAddonSpending,
        isMinimumMet,
        shortfall,
      };
    } catch (error) {
      console.error("Error in calculateTotal:", error);
      // Return default values on error
      return {
        basePrice: 0,
        addonsTotal: 0,
        extraGuestsCost: 0,
        extraGuestsCount: 0,
        extraGuestUnitPrice: 0,
        subtotal: 0,
        vat: 0,
        total: 0,
        weekdayDiscount: 0,
        weekdayDiscountLabel: "",
        isEligibleForDiscount: false,
        selectedPackage: null,
        timeSurcharge: 0,
        timeSurchargeLabel: "",
        subtotalBeforeDiscounts: 0,
        marketingDiscounts: 0,
        minimumSpending: 0,
        currentAddonSpending: 0,
        isMinimumMet: true,
        shortfall: 0,
      };
    }
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
    // Event type minimum spending data
    minimumSpending,
    currentAddonSpending,
    isMinimumMet,
    shortfall,
  } = calculateTotal();

  // Get package name in correct language
  const getPackageName = () => {
    if (!selectedPackage) return t.noPackageSelected || "No package selected";
    if (typeof selectedPackage.name === "object") {
      return (
        selectedPackage.name[language] ||
        selectedPackage.name.th ||
        selectedPackage.name.en ||
        t.noPackageSelected || "No package selected"
      );
    }
    return selectedPackage.name || t.noPackageSelected || "No package selected";
  };

  // Get maximum capacity for the selected package
  const getMaxCapacity = () => {
    if (!selectedPackage) return 0;

    if (state.type === 'event') {
      // For event packages, don't show max capacity section - they use minimum spending model
      return 0;
    } else if (state.type === 'wedding' && selectedPackage.budgetId !== 'budget4') {
      // For wedding packages (except budget4), return the food budget limit as the capacity
      const settings = getSettings();
      const weddingFoodLimits = settings.weddingFoodLimits;
      const budgetLimit = weddingFoodLimits?.[selectedPackage.budgetId];
      return budgetLimit?.limitGuests || 400; // Default to reasonable max if no limit found
    } else {
      // For photo packages and wedding budget4 packages, use existing capacity calculation
      const capacityString = getPackageCapacity(
        state.type,
        state.packageId,
        language
      );
      const { max } = parseCapacityRange(capacityString);
      return max;
    }
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
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
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
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
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

          {/* PDF Preview Content (image raster identical to PDF embed) */}
          <div className="flex-1 overflow-y-auto bg-gray-50 min-h-[400px]">
            {pdfUrl ? (
              <div className="flex flex-col items-center p-4">
                {pdfImageData ? (
                  <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                    <img
                      src={pdfImageData}
                      alt="PDF preview"
                      className="block w-[794px] h-auto"
                      style={{ imageRendering: 'auto' }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8846B]"></div>
                      <div className="text-gray-500">
                        {language === "th" ? "กำลังโหลดตัวอย่าง..." : "Loading preview..."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8846B]"></div>
                  <div className="text-gray-600 text-lg">
                    {language === "th" ? "กำลังสร้าง PDF..." : "Generating PDF..."}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {language === "th" ? "โปรดรอสักครู่..." : "Please wait a moment..."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
            <div
                style={{
                  marginTop: "10px",
                  marginLeft: "20px",
                  fontSize: "10px",
                  color: "#666",
                  textAlign: "left"
                }}
              >
                เพื่อความถูกต้อง กรุณาใช้เบราว์เซอร์ Chrome หรือ Safari
              </div>
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
                disabled={!pdfUrl}
                className="px-6 py-2 bg-[#B8846B] text-white rounded-lg hover:bg-[#A0735A] transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
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

  // Show submit request modal
  if (showSubmitModal) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {language === "th" ? "รับข้อมูลเสนอและโปรไฟล์ปานซื่อ" : "Submit Request and Profile"}
            </h2>
            <button
              onClick={() => setShowSubmitModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-6">
              {language === "th"
                ? "กรอกข้อมูลของท่านเพื่อให้เราส่งใบเสนอราคาและโปรไฟล์ของเรา"
                : "Fill in your information so we can send you our quote and profile"
              }
            </p>

            <form className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "th" ? "อีเมล" : "Email"}
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={submitForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8846B] focus:border-transparent"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "th" ? "เบอร์โทรศัพท์" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  placeholder="+66 81234567"
                  value={submitForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8846B] focus:border-transparent"
                  required
                />
              </div>

              {/* Line ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line ID
                </label>
                <input
                  type="text"
                  placeholder="lineid"
                  value={submitForm.lineId}
                  onChange={(e) => handleFormChange('lineId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8846B] focus:border-transparent"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "th" ? "วันจัดงาน" : "Event Date"}
                </label>
                <input
                  type="date"
                  value={submitForm.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8846B] focus:border-transparent"
                />
              </div>

              {/* Special Request */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Request
                </label>
                <textarea
                  placeholder={language === "th"
                    ? "กรอกความต้องการและข้อคิดเห็นเพิ่มเติม ระบุงานใหม่งานเก่า"
                    : "Fill in additional requirements and comments"}
                  value={submitForm.specialRequest}
                  onChange={(e) => handleFormChange('specialRequest', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8846B] focus:border-transparent resize-none"
                />
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#B8846B] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#A0735A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (language === "th" ? "กำลังส่ง..." : "Submitting...")
                : (language === "th" ? "ส่งข้อมูล" : "Submit Data")
              }
            </button>
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
        data-pdf-template="true"
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
        <div style={{ padding: "40px", width: "794px", minHeight: "1123px", boxSizing: "border-box" }}>
          {/* PDF Header */}
          <div
            style={{
              backgroundColor: "#8b634b",
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
                alignItems: "center",
              }}
            >
              <div style={{ marginTop: "-15px" }}>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "5px"
                  }}
                >
                  ใบประเมินราคาเบื้องต้น
                </h2>
                <p style={{ fontSize: "14px", opacity: "0.9", margin: "0 0 5px 0" }}>
                  Estimated Cost Summary
                </p>
                <p style={{ fontSize: "12px", opacity: "0.8", margin: "0" }}>
                  ชื่อลูกค้า: {customerInfo.name || "ยังไม่ระบุ"} | เบอร์โทร: {customerInfo.tel || "ยังไม่ระบุ"} | อีเมล: {customerInfo.email || "ยังไม่ระบุ"}
                </p>
              </div>
              <div>
                <img
                  src="/RARIN-white-logo.png"
                  alt="Rarin Logo"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Hide image if it fails to load to prevent PDF generation issues
                    e.target.style.display = 'none';
                  }}
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                    filter: "none",
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
                Customer Information
              </h3>
              <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
                <div>
                  <strong>Name:</strong> {customerInfo.name || "ยังไม่ระบุ"}
                </div>
                <div>
                  <strong>Tel:</strong> {customerInfo.tel || submitForm.phone || state.details?.tel || "ยังไม่ระบุ"}
                </div>
                <div>
                  <strong>Email:</strong> {customerInfo.email || submitForm.email || state.details?.email || "ยังไม่ระบุ"}
                </div>
                {/* <div>
                  <strong>Line ID:</strong> {submitForm.lineId || state.details?.lineId || "ยังไม่ระบุ"}
                </div> */}
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
                {/* <div style={{ color: "#B8846B", fontWeight: "bold" }}>ร่าง</div> */}
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
              {/* <h3
                style={{
                  fontWeight: "bold",
                  marginBottom: "1px",
                  paddingBottom: "1px",
                }}
              >
                ผู้ออกใบเสนอราคา:
              </h3> */}
              <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
                <div>
                  <strong>บริษัท ลลิล เวดดิ้ง จำกัด (สำนักงานใหญ่)</strong>
                </div>
                <div>59 ซอย ราษฎร์บูรณะ 11 ถนนราษฎร์บูรณะ</div>
                <div>แขวงบางปะกอก เขตราษฎร์บูรณะ กรุงเทพมหานคร 10140</div>
              </div>
            </div>

            {/* Right side - Order Information */}
            <div>
              <h3
                style={{
                  textAlign: "right",
                }}
              >
                <strong>เลขประจำตัวผู้เสียภาษี</strong>
              </h3>
              <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div>0105567007301</div>
                  <strong>ติดต่อ:</strong>
                  <div>0619461646</div>
                  <div>www.rarinbkk.com</div>
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
                  {state.type === 'event' ? ' - ยอดใช้จ่ายขั้นต่ำ: ฿' + minimumSpending.toLocaleString() : ''}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  {state.type === 'event' ? '-' : '1'}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {state.type === 'event' ? '-' : basePrice.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  {state.type === 'event' ? '-' : basePrice.toLocaleString()}
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
                    {getTranslation("extraGuests", language)} ({extraGuestsCount} {language === 'th' ? 'ท่าน' : 'people'})
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

                {state.people > 0 && state.type !== "photo" && <div><strong>จำนวนแขก:</strong> {state.people} ท่าน</div>}
                {state.type !== "photo" && (
                  <div>
                    <strong>ช่วงเวลา:</strong>{" "}
                    {state.period === "morning"
                      ? "ช่วงเช้า"
                      : state.period === "afternoon"
                        ? "บ่ายเวลา"
                        : "เต็มวัน"}
                  </div>
                )}
                {state.type !== "photo" && (
                  <div>
                    <strong>ประเภทวัน:</strong>{" "}
                    {state.dayType === "weekday"
                      ? "วันธรรมดา"
                      : "วันหยุดสุดสัปดาห์"}
                  </div>
                )}
                <div>
                  <strong>ประเภท:</strong>{" "}
                  {state.type === "wedding"
                    ? "งานแต่งงาน"
                    : state.type === "event"
                      ? "งานอีเวนต์"
                      : "ถ่ายภาพ"}
                </div>
                <div>
                  <strong>ความต้องการพิเศษ:</strong> {state.notes || "-"}
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
              {/* Language Toggle */}
              <div className="absolute top-4 right-4 z-20">
                <LanguageToggle />
              </div>
              {/* Rarin Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/logo-rarin-org.png"
                  alt="Rarin Logo"
                  className="h-16 object-contain"
                />
              </div>
            </div>

            {/* Contact Info Strip */}
            <div className="border-b border-gray-200 p-4">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                <div className="flex items-center justify-center text-center">
                  <span>📞 <br />TEL<br />06-1946-1646</span>
                </div>
                <div className="flex items-center justify-center text-center">
                  <span>📧 <br />Email<br />rarin.venue@gmail.com</span>
                </div>
                <div className="flex items-center justify-center text-center">
                  <span>💬<br /> Line Official<br />@rarinbkk</span>
                </div>
                <div className="flex items-center justify-center text-center">
                  <span>
                    🕒<br />Office Time<br />10:00-19:00
                    <br />
                    Everyday
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
                  {t.estimationDescription || "สรุปราคาสำหรับงานของคุณ"}
                </p>
              </div>

              {/* Customer Information Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {t.customerInformation || "ข้อมูลลูกค้า"}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {language === 'th' 
                    ? 'กรุณากรอกข้อมูลของคุณเพื่อใช้ในการออกใบประเมินราคา' 
                    : 'Please fill in your information for the quotation'}
                </p>
                <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#B8846B] focus:border-transparent"
                    placeholder={language === 'th' ? 'ชื่อลูกค้า' : 'Customer name'}
                  />
                  <input
                    type="tel"
                    value={customerInfo.tel}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, tel: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#B8846B] focus:border-transparent"
                    placeholder={language === 'th' ? 'เบอร์โทรศัพท์' : 'Telephone'}
                  />
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#B8846B] focus:border-transparent"
                    placeholder={language === 'th' ? 'อีเมล' : 'Email'}
                  />
                </div>
              </div>

              {/* Package Summary */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {t.serviceSummary || "สรุปรายการ"}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {/* Package Details with Capacity */}
                  <div className="mb-3 border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span>
                        {state.type === 'event'
                          ? (language === "th"
                            ? `${t.packageType || "ค่าแพ็กเกจ"} (${getPackageName()}) - ยอดใช้จ่ายขั้นต่ำ: ฿${minimumSpending.toLocaleString()}`
                            : `${t.packageType || "Package"} (${getPackageName()}) - Minimum Spending: ฿${minimumSpending.toLocaleString()}`
                          )
                          : `${t.packageType || "ค่าแพ็กเกจ"} (${getPackageName()})`
                        }
                      </span>
                      <span className="font-semibold">
                        {state.type === 'event' ? '-' : `฿${basePrice.toLocaleString()}`}
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

                        {/*show this section when number of guests is greater than max capacity and not event type*/}
                        {state.type === 'wedding' && state.people > getMaxCapacity() && getMaxCapacity() > 0 && (
                          <div>
                            {language === "th"
                              ? "อาหารเบสิคไทยบุฟเฟ่ห์ : "
                              : "Basic Thai Buffet capacity: "}
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
                        {state.type === 'event'
                          ? (language === "th" ? "บริการที่เลือก:" : "Selected Services:")
                          : (language === "th" ? "บริการเสริม:" : "Add-on Services:")
                        }
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
                          {t.extraGuestsCalculation || "คำนวณแขกเพิ่มเติม"} ({extraGuestsCount} {language === 'th' ? 'ท่าน' : 'people'} × ฿
                          {extraGuestUnitPrice.toLocaleString()})
                        </span>
                        <span>฿{extraGuestsCost.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Discounts Section (marketing discounts + weekday discount) - Moved to last */}
                  {(negativeSelectedAddons.length > 0 ||
                    weekdayDiscount > 0) && (
                      <div className="mt-3 border-t pt-3">
                        <div className="font-medium text-[#B8846B] mb-2">
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
              <button
                onClick={handleSubmitRequest}
                className="w-full bg-[#B8846B] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#A0735A] transition-colors mb-4"
              >
                {t.submitRequest || "ส่งคำขอจอง"}
              </button>

              {/* Bottom Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors"
                >
                  {t.backToEdit || "กลับไปแก้ไข"}
                </button>
                <button
                  onClick={() => window.open("https://line.me/R/ti/p/@605fnobr", "_blank")}
                  className="bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors"
                >
                  {t.lineOA || "Line Official"}
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
