import axios from 'axios'

// Currency Exchange API
const EXCHANGE_API_BASE = 'https://api.exchangerate-api.com/v4/latest'

/**
 * Fetch exchange rates based on a base currency.
 * Returns an object with currency codes as keys and rates as values.
 */
export async function fetchExchangeRates(baseCurrency = 'INR') {
  try {
    const response = await axios.get(`${EXCHANGE_API_BASE}/${baseCurrency}`)
    return response.data
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    throw error
  }
}

/**
 * Convert an amount from one currency to another.
 */
export async function convertCurrency(amount, from = 'INR', to = 'USD') {
  try {
    const data = await fetchExchangeRates(from)
    const rate = data.rates[to]
    if (!rate) {
      throw new Error(`Exchange rate not found for ${to}`)
    }
    return {
      convertedAmount: amount * rate,
      rate,
      from,
      to
    }
  } catch (error) {
    console.error('Error converting currency:', error)
    throw error
  }
}

// Popular currencies for the converter
export const POPULAR_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
]
