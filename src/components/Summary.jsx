import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import {
  getPackages,
  getSettings,
  getBudget4TimeOptions,
  getAddonCategories,
} from "../data";
import {
  useTranslations,
  getPackageCapacity,
  parseCapacityRange,
} from "../i18n";

function calcTotal(
  type,
  packageId,
  addons,
  people,
  dayType,
  period,
  language = "th"
) {
  const pkg = getPackages(type).find((p) => p.id === packageId);
  const settings = getSettings();
  const budget4TimeOptions = getBudget4TimeOptions();

  // Special handling for photo type - no add-ons, no extra guests calculation
  if (type === 'photo') {
    const base = pkg ? pkg.price : 0;
    const packageName = pkg
      ? typeof pkg.name === "object"
        ? pkg.name[language] || pkg.name.th || pkg.name.en || ""
        : pkg.name || ""
      : "";

    const subtotal = base;
    const vat = Math.round(subtotal * settings.vatRate);
    const total = subtotal + vat;

    return {
      packageName,
      base,
      addons: 0,
      marketingDiscounts: 0,
      extra: 0,
      extraGuestsCount: 0,
      extraGuestUnitPrice: 0,
      maxCapacity: 0,
      subtotalBeforeDiscounts: subtotal,
      totalDiscounts: 0,
      subtotal,
      vat,
      total,
      weekdayDiscount: 0,
      weekdayDiscountLabel: "",
      isEligibleForDiscount: false,
      timeSurcharge: 0,
      timeSurchargeLabel: "",
      minimumSpending: 0,
      currentAddonSpending: 0,
      isMinimumMet: true,
      shortfall: 0,
    };
  }

  // Calculate base price based on package type and day type
  let base = 0;
  if (pkg) {
    // Check if package has weekday/weekend specific pricing (for event packages)
    if (pkg.weekdayPrice !== undefined && pkg.weekendPrice !== undefined) {
      base = dayType === "weekday" ? pkg.weekdayPrice : pkg.weekendPrice;
    } else {
      base = pkg.price;
    }
  }

  // Handle package name - it can be either a string or an object with language keys
  const packageName = pkg
    ? typeof pkg.name === "object"
      ? pkg.name[language] || pkg.name.th || pkg.name.en || ""
      : pkg.name || ""
    : "";

  // Separate positive addons from negative (discounts)
  // Only consider numeric values (defensive) and sum positives / negatives separately
  const positiveAddons = Object.values(addons).reduce((acc, v) => {
    const n = typeof v === "number" ? v : Number(v) || 0;
    return acc + (n > 0 ? n : 0);
  }, 0);
  const marketingDiscounts = Object.values(addons).reduce((acc, v) => {
    const n = typeof v === "number" ? v : Number(v) || 0;
    return acc + (n < 0 ? n : 0);
  }, 0);
  const addonsSum = positiveAddons + marketingDiscounts;

  // Calculate extra guest charges based on package capacity
  let extra = 0;
  let extraGuestsCount = 0;
  let extraGuestUnitPrice = 0;
  let maxCapacity = 0;

  if (pkg && people > 0) {
    if (type === 'wedding' && pkg.budgetId !== 'budget4') {
      // For wedding type (except budget4), use food budget limits from settings
      const weddingFoodLimits = settings.weddingFoodLimits;
      const budgetLimit = weddingFoodLimits?.[pkg.budgetId];
      
      if (budgetLimit) {
        const foodLimitGuests = budgetLimit.limitGuests;
        extraGuestUnitPrice = budgetLimit.extraGuestPrice;
        
        // Calculate extra guests if current guest count exceeds food limit
        if (people > foodLimitGuests) {
          extraGuestsCount = people - foodLimitGuests;
          extra = extraGuestsCount * extraGuestUnitPrice;
        }
        
        // Set maxCapacity for display purposes (use a reasonable max like 400)
        maxCapacity = 400;
      }
    } else if (type === 'photo' || (type === 'wedding' && pkg.budgetId === 'budget4')) {
      // For photo types and wedding budget4 packages only, use existing capacity-based calculation
      // Event types do not have extra guest charges - they work on minimum spending model
      // Get package capacity
      const capacityString = getPackageCapacity(type, packageId, language);
      const capacityData = parseCapacityRange(capacityString);
      maxCapacity = capacityData.max;

      // Calculate extra guests if current guest count exceeds max capacity
      if (people > maxCapacity) {
        extraGuestsCount = people - maxCapacity;

        // Find selected food addon to get price per person
        const configAddons = getAddonCategories(type);
        let foodAddonPrice = 0;

        // Look through all addon categories to find selected food items
        if (configAddons) {
          Object.values(configAddons).forEach((category) => {
            if (category.items) {
              category.items.forEach((item) => {
                // Check if this addon is selected and is a per_person food item
                const addonValue = addons?.[item.id];
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
        extra = extraGuestsCount * extraGuestUnitPrice;
      }
    }
    // For event types, we don't calculate extra guest charges at all
    // Event packages work on minimum spending model, not capacity + extra guest fees
  }

  // Check for budget4 specific time surcharges
  let timeSurcharge = 0;
  let timeSurchargeLabel = "";

  if (pkg?.budgetId === "budget4") {
    const selectedTimeOption = budget4TimeOptions.find(
      (option) => option.value === period
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
    // Add full day surcharge for other packages if period contains "Full Day" or "เต็มวัน"
    timeSurcharge =
      period && (period.includes("Full Day") || period.includes("เต็มวัน"))
        ? settings.fullDaySurcharge
        : 0;
    if (timeSurcharge > 0) {
      timeSurchargeLabel = "ค่าบริการเต็มวัน";
    }
  }

  // Apply weekday discount
  let weekdayDiscount = 0;
  let weekdayDiscountLabel = "";

  if (dayType === "weekday") {
    if (pkg?.budgetId === "budget4") {
      // Budget4 packages get flat ฿40,000 discount on weekdays
      weekdayDiscount = settings.budget4WeekdayDiscount;
      weekdayDiscountLabel = "ส่วนลดวันธรรมดา (฿40,000)";
    } else if (pkg?.weekdayDiscountEligible === true) {
      // Other eligible packages get ฿20,000 discount
      weekdayDiscount = settings.weekdayDiscount;
      weekdayDiscountLabel = "ส่วนลดวันธรรมดา (฿20,000)";
    }
  }

  const isEligibleForDiscount =
    pkg?.budgetId === "budget4" || pkg?.weekdayDiscountEligible === true;

  // Calculate subtotal before discounts
  let subtotalBeforeDiscounts;
  if (type === 'event') {
    // For event type, don't include base package price in calculations
    // Only show minimum spending requirement and current addon spending
    subtotalBeforeDiscounts = addonsSum + extra + timeSurcharge;
  } else {
    // For other types, use normal calculation
    subtotalBeforeDiscounts = base + addonsSum + extra + timeSurcharge;
  }

  // Calculate total discounts
  const totalDiscounts = weekdayDiscount + Math.abs(marketingDiscounts);

  // Final subtotal after discounts (before VAT)
  let subtotal;
  if (type === 'event') {
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

  if (type === 'event' && pkg) {
    minimumSpending = pkg.minSpend || 0;
    
    // Calculate current addon spending (food & beverage + alcoholic packages)
    currentAddonSpending = positiveAddons;
    
    // Check if minimum is met
    isMinimumMet = currentAddonSpending >= minimumSpending;
    shortfall = isMinimumMet ? 0 : minimumSpending - currentAddonSpending;
  }

  return {
    packageName,
    base,
    addons: positiveAddons,
    marketingDiscounts: Math.abs(marketingDiscounts),
    extra,
    extraGuestsCount,
    extraGuestUnitPrice,
    maxCapacity,
    subtotalBeforeDiscounts,
    totalDiscounts,
    subtotal,
    vat,
    total,
    weekdayDiscount,
    weekdayDiscountLabel,
    isEligibleForDiscount,
    timeSurcharge,
    timeSurchargeLabel,
    // Event type minimum spending data
    minimumSpending,
    currentAddonSpending,
    isMinimumMet,
    shortfall,
  };
}

export default function Summary() {
  const state = useStore();
  const navigate = useNavigate();
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = React.useState(true);

  const {
    packageName,
    base,
    addons,
    marketingDiscounts,
    extra,
    extraGuestsCount,
    extraGuestUnitPrice,
    maxCapacity,
    subtotalBeforeDiscounts,
    totalDiscounts,
    subtotal,
    vat,
    total,
    weekdayDiscount,
    weekdayDiscountLabel,
    isEligibleForDiscount,
    timeSurcharge,
    timeSurchargeLabel,
    // Event type minimum spending data
    minimumSpending,
    currentAddonSpending,
    isMinimumMet,
    shortfall,
  } = useMemo(
    () =>
      calcTotal(
        state.type,
        state.packageId,
        state.addons,
        state.people,
        state.dayType,
        state.period,
        state.language
      ),
    [
      state.type,
      state.packageId,
      state.addons,
      state.people,
      state.dayType,
      state.period,
      state.language,
    ]
  );

  // Reset booking attempt flag when minimum is met
  React.useEffect(() => {
    if (state.type === 'event' && isMinimumMet && state.hasAttemptedBooking) {
      state.setHasAttemptedBooking(false);
    }
  }, [state.type, isMinimumMet, state.hasAttemptedBooking, state.setHasAttemptedBooking]);

  // Get selected addon details for display
  const selectedAddons = useMemo(() => {
    const addonsList = [];

    // Photo type should not have any add-ons
    if (state.type === "photo") {
      return addonsList;
    }

    if (state.type === "wedding") {
      // Custom services for wedding packages (matching AddonsSelect.jsx)
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

      // Iterate known service keys (defensive) and include only non-zero numeric values
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
        // Handle service name - it can be either a string or an object with language keys
        const serviceName =
          typeof service.name === "object"
            ? service.name[state.language] ||
              service.name.th ||
              service.name.en ||
              ""
            : service.name || "";

        addonsList.push({
          name: serviceName,
          value: value,
          isDiscount: value < 0,
        });
      });
    } else {
      // For event and photo types, get addons from config and translations
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
            addon.name[state.language] || addon.name.th || addon.name.en || "";
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
              ? addon.unit[state.language] ||
                addon.unit.th ||
                addon.unit.en ||
                ""
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
          name: addonName,
          value: value,
          quantity: quantity,
          unitPrice: unitPrice,
          isDiscount: value < 0,
        });
      });
    }

    return addonsList;
  }, [state.addons, state.language, state.type]);

  const handleReset = () => {
    // Reset all state and go back to step 1
    state.setHasAttemptedBooking(false);
    state.reset();
    state.setStep(0);
  };

  const handleBookInquiry = () => {
    console.log("Book inquiry clicked!");

    // Set that user has attempted to book
    state.setHasAttemptedBooking(true);

    // For event type, check minimum spending requirement
    if (state.type === 'event' && !isMinimumMet) {
      // Don't proceed with booking if minimum not met
      return;
    }

    // Store the booking data in localStorage for the booking confirmation page
    localStorage.setItem("bookingData", JSON.stringify(state));

    try {
      navigate("/booking-confirmation");
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback: use window.location
      window.location.href = "/booking-confirmation";
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-stone-800">{t.summary}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-stone-500 hover:text-stone-700 cursor-pointer p-1"
            title={isExpanded ? "Hide details" : "Show details"}
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
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
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
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm">
          {/* Base Package with Guest Info - Show differently for event type */}
          {state.type === 'event' ? (
            <>
              <div className="font-medium text-stone-700 mb-2">
                {state.language === "th" ? "แพ็กเกจพื้นฐาน" : "Base Package"}
              </div>
              <div className="text-xs text-stone-500 ml-4 space-y-1">
                <div>{packageName}</div>
                <div>
                  {state.language === "th" ? "ยอดใช้จ่ายขั้นต่ำของแพ็กเกจ: " : "Package minimum spending: "}
                  <span className="font-medium text-stone-700">
                    ฿{minimumSpending.toLocaleString()}
                  </span>
                </div>
                {state.people > 0 && (
                  <div>
                    {state.language === "th" ? "จำนวนแขก: " : "Number of guests: "}
                    <span className="font-medium text-stone-700">
                      {state.people} {state.language === "th" ? "ท่าน" : "people"}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Row
                label={state.language === "th" ? "แพ็กเกจหลัก" : "Base Package"}
                value={base}
              />
              <div className="text-xs text-stone-500 ml-4 -mt-1 space-y-1">
                <div>{packageName}</div>
                {state.people > 0 && (
                  <>
                    <div>
                      {state.language === "th" ? "จำนวนแขก: " : "Number of guests: "}
                      <span className="font-medium text-stone-700">
                        {state.people} {state.language === "th" ? "ท่าน" : "people"}
                      </span>
                    </div>
                    {state.people > maxCapacity && (
                      <div>
                        {state.language === "th" ? "รองรับสูงสุด: " : "Max capacity: "}
                        <span className="font-medium text-stone-700">
                          {maxCapacity} {state.language === "th" ? "ท่าน" : "people"}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Add-ons Services */}
          {selectedAddons.length > 0 && (
            <>
              <div className="font-medium text-stone-700 mt-4">
                {state.type === 'event' 
                  ? (state.language === "th" ? "บริการที่เลือก" : "Selected Services")
                  : (state.language === "th" ? "บริการเสริม" : "Add-on Services")
                }
              </div>
              {selectedAddons
                .filter((addon) => !addon.isDiscount)
                .map((addon, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs ml-4"
                  >
                    <span className="text-stone-600">
                      • {addon.name}
                      {addon.quantity &&
                        addon.quantity > 1 &&
                        ` × ${addon.quantity}`}
                    </span>
                    <span className="text-stone-600">
                      ฿{addon.value.toLocaleString()}
                    </span>
                  </div>
                ))}
            </>
          )}

          {/* Time Surcharge */}
          {timeSurcharge > 0 && (
            <Row
              label={
                state.language === "th"
                  ? timeSurchargeLabel
                  : timeSurchargeLabel === "ค่าบริการครึ่งวันบ่าย"
                  ? "Afternoon Surcharge"
                  : "Full Day Surcharge"
              }
              value={timeSurcharge}
            />
          )}

          {/* Extra Guests */}
          {extra > 0 && extraGuestsCount > 0 && (
            <Row
              label={
                state.language === "th"
                  ? `แขกเพิ่มเติม (${extraGuestsCount} ท่าน × ฿${extraGuestUnitPrice.toLocaleString()})`
                  : `Extra Guests (${extraGuestsCount} people × ฿${extraGuestUnitPrice.toLocaleString()})`
              }
              value={extra}
            />
          )}

          <hr className="border-stone-200" />

          {/* Subtotal Before Discounts - different for event type */}
          {state.type === 'event' ? (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวมบริการ (ก่อนส่วนลด)"
                  : "Total Services (before discount)"
              }
              value={subtotalBeforeDiscounts}
            />
          ) : (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวม (ก่อนส่วนลด)"
                  : "Subtotal (before discount)"
              }
              value={subtotalBeforeDiscounts}
            />
          )}

          {/* Total Discounts */}
          {totalDiscounts > 0 && (
            <>
              <div className="font-medium text-[#B8846B] mt-2">
                {state.language === "th" ? "ส่วนลดทั้งหมด" : "Total Discounts"}
              </div>

              {/* Marketing Discounts */}
              {selectedAddons
                .filter((addon) => addon.isDiscount)
                .map((addon, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs ml-4 text-[#B8846B]"
                  >
                    <span>• {addon.name}</span>
                    <span>-฿{Math.abs(addon.value).toLocaleString()}</span>
                  </div>
                ))}

              {/* Weekday Discount */}
              {weekdayDiscount > 0 && (
                <div className="flex justify-between text-xs ml-4 text-[#B8846B]">
                  <span>
                    •{" "}
                    {state.language === "th"
                      ? weekdayDiscountLabel
                      : weekdayDiscountLabel.includes("฿40,000")
                      ? "Weekday Discount (฿40,000)"
                      : "Weekday Discount (฿20,000)"}
                  </span>
                  <span>-฿{weekdayDiscount.toLocaleString()}</span>
                </div>
              )}

              <Row
                label={state.language === "th" ? "รวมส่วนลด" : "Total Discount"}
                value={-totalDiscounts}
                className="text-[#B8846B] font-medium"
              />
            </>
          )}

          <hr className="border-stone-200" />

          {/* Subtotal (Before VAT) - different for event type */}
          {state.type === 'event' ? (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวมบริการ (ก่อน VAT)"
                  : "Total Services (before VAT)"
              }
              value={subtotal}
            />
          ) : (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวม (ก่อน VAT)"
                  : "Subtotal (before VAT)"
              }
              value={subtotal}
            />
          )}

          {/* VAT */}
          <Row
            label={state.language === "th" ? "VAT (7%)" : "VAT (7%)"}
            value={vat}
          />

          <hr className="border-stone-200" />

          {/* Event Type Minimum Spending Check - Only show after booking attempt and not met */}
          {state.type === 'event' && minimumSpending > 0 && state.hasAttemptedBooking && !isMinimumMet && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <div className="font-medium text-amber-800">
                  {state.language === "th" ? "การใช้จ่ายขั้นต่ำ" : "Minimum Spending"}
                </div>
                <Row
                  label={
                    state.language === "th"
                      ? "ยอดใช้จ่ายขั้นต่ำที่กำหนด"
                      : "Required minimum spending"
                  }
                  value={minimumSpending}
                  className="text-amber-700"
                />
                <Row
                  label={
                    state.language === "th"
                      ? "ยอดเลือกบริการปัจจุบัน (อาหาร & เครื่องดื่ม)"
                      : "Current selection (Food & Beverage)"
                  }
                  value={currentAddonSpending}
                  className="text-red-700"
                />
                
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 font-medium text-sm">
                    {state.language === "th" 
                      ? "⚠️ การเลือกของท่านยังไม่ถึงยอดใช้จ่ายขั้นต่ำ"
                      : "⚠️ Your selection does not meet the minimum spending requirement"
                    }
                  </div>
                  <div className="text-red-700 text-sm mt-1">
                    {state.language === "th" 
                      ? `กรุณาเพิ่มบริการ ฿${shortfall.toLocaleString()} เพื่อครบตามเงื่อนไข`
                      : `Please add ฿${shortfall.toLocaleString()} more to meet the requirement`
                    }
                  </div>
                </div>
              </div>
              
              <hr className="border-stone-200" />
            </>
          )}

          {/* Total with VAT - different for event type */}
          {state.type === 'event' ? (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวมบริการทั้งสิ้น (รวม VAT)"
                  : "Total Services with VAT (7%)"
              }
              value={total}
              bold
            />
          ) : (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวมทั้งสิ้น (รวม VAT)"
                  : "Total with VAT (7%)"
              }
              value={total}
              bold
            />
          )}
        </div>
      )}

      {/* Always show total and book button */}
      {!isExpanded && (
        <div className="mt-3 py-2 border-t border-stone-200">
          {state.type === 'event' ? (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวมบริการทั้งสิ้น (รวม VAT)"
                  : "Total Services with VAT (7%)"
              }
              value={total}
              bold
            />
          ) : (
            <Row
              label={
                state.language === "th"
                  ? "ยอดรวมทั้งสิ้น (รวม VAT)"
                  : "Total with VAT (7%)"
              }
              value={total}
              bold
            />
          )}
        </div>
      )}

      <button
        onClick={handleBookInquiry}
        className="btn btn-primary w-full mt-3"
      >
        {t.bookInquiry}
      </button>
      
      {state.type === 'event' && state.hasAttemptedBooking && !isMinimumMet && (
        <div className="mt-2 text-center text-sm text-red-600">
          {state.language === "th" 
            ? "กรุณาเลือกบริการให้ครบตามยอดใช้จ่ายขั้นต่ำก่อนดำเนินการจอง"
            : "Please meet the minimum spending requirement before booking"
          }
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, className }) {
  return (
    <div className={`flex items-center justify-between ${className || ""}`}>
      <span className={"text-stone-700 " + (bold ? "font-semibold" : "")}>
        {label}
      </span>
      <span className={"tabular-nums " + (bold ? "font-semibold" : "")}>
        ฿{value.toLocaleString()}
      </span>
    </div>
  );
}
