# Configuration System Documentation

## Overview
The application now uses a centralized JSON configuration system that allows you to modify all content, packages, add-ons, and options by editing a single file: `src/config.json`.

## Key Features
✅ **Centralized Configuration**: All event types, packages, add-ons, and translations in one file
✅ **Multi-language Support**: Thai and English translations for all content
✅ **Easy Maintenance**: Change pricing, descriptions, and options without touching code
✅ **Backward Compatibility**: Existing components work seamlessly with new system

## Configuration Structure

### Event Types (`config.eventTypes`)
```json
{
  "eventTypes": {
    "wedding": {
      "name": { "th": "งานแต่งงาน", "en": "Wedding" },
      "icon": "💒"
    },
    "event": {
      "name": { "th": "งานอีเวนต์", "en": "Event" },
      "icon": "🎉"
    }
  }
}
```

### Packages (`config.packages`)
Each event type has its own package array with enhanced details:
```json
{
  "packages": {
    "wedding": [
      {
        "id": "basic",
        "name": { "th": "แพ็คเกจคลาสสิก", "en": "Classic Package" },
        "price": 8500,
        "popular": true,
        "description": { "th": "เหมาะสำหรับงานแต่งงานแบบคลาสสิก", "en": "Perfect for classic weddings" },
        "area": "300 ตร.ม.",
        "timeSlots": ["10:00-18:00", "18:00-22:00"],
        "features": [
          "Photo booth พร้อมอุปกรณ์",
          "ดนตรีและเสียง",
          "การตกแต่งพื้นฐาน"
        ],
        "equipmentServices": [
          "ไฟแสงสี LED",
          "ระบบเสียงและไมโครโฟน",
          "พื้นที่จัดงาน"
        ]
      }
    ]
  }
}
```

### Add-ons (`config.addons`)
Organized by event type and category:
```json
{
  "addons": {
    "wedding": {
      "breaks": {
        "title": { "th": "BREAKS", "en": "BREAKS" },
        "items": [
          {
            "id": "coffee_break",
            "name": { "th": "กาแฟเบรค", "en": "Coffee Break" },
            "description": "กาแฟและขนมเบื้องต้น",
            "price": 120,
            "type": "checkbox"
          }
        ]
      }
    }
  }
}
```

### Time Options (`config.timeOptions`)
```json
{
  "timeOptions": [
    { "id": "morning", "label": { "th": "เช้า (9:00-12:00)", "en": "Morning (9:00-12:00)" } },
    { "id": "afternoon", "label": { "th": "บ่าย (13:00-17:00)", "en": "Afternoon (13:00-17:00)" } }
  ]
}
```

### Translations (`config.translations`)
All UI text in multiple languages:
```json
{
  "translations": {
    "th": {
      "step1Title": "เลือกประเภทงาน",
      "step2Title": "เลือกแพ็คเกจ",
      "step3Title": "กรอกรายละเอียด",
      "step4Title": "เลือกเสริม"
    },
    "en": {
      "step1Title": "Select Event Type",
      "step2Title": "Choose Package",
      "step3Title": "Enter Details",
      "step4Title": "Select Add-ons"
    }
  }
}
```

## How to Make Changes

### 1. Add New Event Type
Edit `config.eventTypes`:
```json
"photoshoot": {
  "name": { "th": "ถ่ายภาพ", "en": "Photoshoot" },
  "icon": "📸"
}
```

### 2. Add New Package
Add to the appropriate event type in `config.packages`:
```json
{
  "id": "premium",
  "name": { "th": "แพ็คเกจพรีเมียม", "en": "Premium Package" },
  "price": 15000,
  "popular": false,
  "description": { "th": "แพ็คเกจระดับพรีเมียม", "en": "Premium level package" },
  "area": "500 ตร.ม.",
  "timeSlots": ["09:00-21:00"],
  "features": ["Premium features..."],
  "equipmentServices": ["Premium equipment..."]
}
```

### 3. Add New Add-on Category
Add to the appropriate event type in `config.addons`:
```json
"decorations": {
  "title": { "th": "การตกแต่ง", "en": "Decorations" },
  "items": [
    {
      "id": "flowers",
      "name": { "th": "ดอกไม้ตกแต่ง", "en": "Flower Decoration" },
      "description": "ดอกไม้สดตกแต่งงาน",
      "price": 2500,
      "type": "checkbox"
    }
  ]
}
```

### 4. Update Translations
Add new text to `config.translations.th` and `config.translations.en`:
```json
"newFeature": { "th": "ฟีเจอร์ใหม่", "en": "New Feature" }
```

### 5. Change Pricing
Simply update the `price` field in packages or add-ons:
```json
"price": 10000  // Old: 8500
```

## Add-on Types

### 1. Checkbox (`type: "checkbox"`)
Single selection per category, like radio buttons

### 2. Input (`type: "input"`)
Quantity input with price per unit

### 3. Grid (`type: "grid"`)
Similar to input but with grid layout (quantity input)

## Integration Points

### Data Access Functions
The system provides helper functions in `src/data.js`:
- `getEventTypes()` - Get all event types
- `getPackages(type)` - Get packages for specific event type
- `getAddons(type)` - Get add-ons for specific event type (flattened)
- `getTimeOptions()` - Get all time options
- `getTranslations(language)` - Get translations for specific language

### Component Updates
All components now use the config system:
- ✅ `TypeSelector.jsx` - Uses `getEventTypes()`
- ✅ `PackageSelect.jsx` - Uses `getPackages()`
- ✅ `PackageCard.jsx` - Enhanced with config data
- ✅ `DetailsInput.jsx` - Uses `getTimeOptions()`
- ✅ `AddonsSelect.jsx` - Uses config add-ons structure
- ✅ `Summary.jsx` - Uses `getPackages()`
- ✅ `BookingConfirmation.jsx` - Uses `getPackages()` and `getAddons()`

## Benefits

1. **Single Source of Truth**: All configuration in one file
2. **No Code Changes**: Modify content without touching React components
3. **Multi-language**: Easy to add new languages or update translations
4. **Scalable**: Easy to add new event types, packages, and add-ons
5. **Maintainable**: Clear structure and organization
6. **Flexible**: Support for different add-on types and layouts

## File Locations
- **Main Config**: `src/config.json`
- **Data Layer**: `src/data.js` (provides helper functions)
- **Components**: `src/components/*.jsx` (all updated to use config)

This system makes your application highly configurable and easy to maintain!