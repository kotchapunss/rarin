// Utility functions for language support
import { useCalc } from './store'

export function useCurrency() {
  const { language } = useCalc()
  
  return {
    format: (amount) => {
      const formatted = amount.toLocaleString()
      return language === 'th' ? `฿${formatted}` : `฿${formatted}`
    },
    symbol: '฿'
  }
}

export function useDirection() {
  const { language } = useCalc()
  return language === 'th' ? 'ltr' : 'ltr' // Both languages use left-to-right
}