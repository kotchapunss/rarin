# Wedding Food Budget Implementation Summary

## Overview
Implemented a wedding food budget limit system where extra guests beyond the food budget limit are charged ฿950 per person.

## Budget Limits
- **Budget 1** (not over ฿150,000): 50 guests food limit, extra guests × ฿950
- **Budget 2** (฿150,000-300,000): 50 guests food limit, extra guests × ฿950  
- **Budget 3** (฿300,000-400,000): 100 guests food limit, extra guests × ฿950
- **Budget 4** (฿400,000+): **NO FOOD BUDGET LIMIT** - uses venue capacity-based calculation

## Changes Made

### 1. Configuration Changes (`src/config.json`)
Added `weddingFoodLimits` section to settings:
```json
"weddingFoodLimits": {
  "budget1": {
    "limitGuests": 50,
    "extraGuestPrice": 950
  },
  "budget2": {
    "limitGuests": 50,
    "extraGuestPrice": 950
  },
  "budget3": {
    "limitGuests": 100,
    "extraGuestPrice": 950
  }
}
```
**Note:** Budget4 is excluded - it has no food budget limits.

### 2. Summary Component (`src/components/Summary.jsx`)
- Updated `calcTotal` function to handle wedding food budget limits
- For wedding packages (budget1-3): uses food budget limits
- For wedding budget4 packages: uses existing venue capacity-based calculation
- Added extra guests display section in the UI
- Shows format: "แขกเพิ่มเติม (X ท่าน × ฿950) = ฿Y"

### 3. Booking Confirmation (`src/components/BookingConfirmation.jsx`)
- Updated extra guest calculation to match Summary logic
- Modified `getMaxCapacity()` function for wedding packages
- Budget4 wedding packages use venue capacity instead of food limits
- Maintains existing PDF and detail display functionality

### 4. Details Input (`src/components/Step3DetailsInput.jsx`)
- Updated capacity calculation for wedding packages
- Budget1-3: uses food budget limits as max guests for input validation
- Budget4: uses venue capacity-based calculation (same as events)
- Added warning message when guests exceed food budget limit (budget1-3 only)
- Shows amber warning box with extra cost calculation

### 5. Language Files
Added new translation keys:
- `foodBudgetExceeded`: "แขกเกินงบอาหาร" / "Guests exceed food budget"
- `guestsOverLimit`: "จำนวนแขกเกิน" / "Over"
- `extraGuestCost`: "ค่าแขกเพิ่มเติม" / "Extra guest cost"

## Behavior Summary
1. **Wedding budget1-3**: Extra guests calculated when exceeding food budget limit
2. **Wedding budget4**: Uses venue capacity-based calculation (same as events)
3. **Event/Photo packages**: Maintains existing capacity-based calculation
4. **UI displays**: Shows food budget limits as guest input limits for wedding budget1-3
5. **Warnings**: Real-time warning when wedding guests exceed food budget (budget1-3 only)
6. **Calculations**: ฿950/guest extra charge for wedding budget1-3 packages

## Testing
- Wedding budget1/budget2: 50 guest limit, extra guests × ฿950
- Wedding budget3: 100 guest limit, extra guests × ฿950
- Wedding budget4: NO food budget limit, uses venue capacity
- Event packages: Unchanged behavior (venue capacity-based)
- Photo packages: No guest limits (unchanged)

All existing functionality and UI styling preserved.