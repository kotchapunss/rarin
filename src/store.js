
import { create } from 'zustand'
import { updateLanguage } from './data'

export const useStore = create((set) => ({
  step: 0,
  type: 'wedding', // wedding | event | photo
  budget: null, // New budget selection
  packageId: null,
  people: 20,
  period: 'morning', // morning | afternoon | evening
  dayType: 'weekend', // weekday | weekend
  addons: {},
  addonsQuantity: {},
  notes: '',
  language: 'en', // en | th
  hasAttemptedBooking: false, // Track if user has attempted to proceed without meeting minimum spending
  prices: {
    base: 0,
    addons: 0
  },
  setStep: (n) => set({ step: Math.max(0, Math.min(4, n)) }), // Updated to 4 steps for wedding
  setType: (t) => set({ type: t, budget: null, packageId: null, addons: {} }), // Reset budget, package, and addons when type changes
  setBudget: (b) => set({ budget: b, packageId: null }), // New budget setter, reset package when budget changes
  setPackage: (id) => set({ packageId: id }),
  setPeople: (n) => set({ people: n }),
  setPeriod: (p) => set({ period: p }),
  setDayType: (dt) => set({ dayType: dt }),
  // Set an addon value. If price is 0 or falsy, the addon is removed.
  // This replaces the previous toggle-only behavior so callers can explicitly set quantities/prices.
  toggleAddon: (id, price, quantity) => set((s) => {
    const next = { ...s.addons }
    const nextQuantity = { ...s.addonsQuantity }
    // If price is 0, null, or undefined -> remove the addon
    if (price === 0 || price === null || typeof price === 'undefined') {
      if (next[id]) delete next[id]
      if (nextQuantity[id]) delete nextQuantity[id]
    } else {
      // Otherwise set the explicit price (can be negative for discounts)
      next[id] = price
      nextQuantity[id] = quantity; // Default quantity to 1 when setting a price
    }
    return { addons: next, addonsQuantity: nextQuantity }
  }),
  setNotes: (v) => set({ notes: v }),
  setLanguage: (lang) => set((state) => {
    // Update data language when store language changes
    updateLanguage(lang);
    return { language: lang };
  }),
  setHasAttemptedBooking: (attempted) => set({ hasAttemptedBooking: attempted }),
  reset: () => set({
    step: 0,
    type: 'wedding',
    budget: null,
    packageId: null,
    people: 0,
    period: 'morning',
    dayType: 'weekend',
    addons: {},
    notes: '',
    hasAttemptedBooking: false,
    prices: {
      base: 0,
      addons: 0
    }
  }),
}))

// Keep backward compatibility
export const useCalc = useStore
