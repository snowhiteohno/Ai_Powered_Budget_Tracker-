/**
 * Format a number as Indian Rupees (₹).
 * Uses the Indian numbering system (lakh, crore).
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0'

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  return formatter.format(amount)
}

/**
 * Format a number as Indian Rupees with decimals.
 */
export function formatCurrencyDetailed(amount) {
  if (amount === null || amount === undefined) return '₹0.00'

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return formatter.format(amount)
}

/**
 * Format a number as a compact currency string.
 * e.g., ₹1.5L, ₹2.3Cr
 */
export function formatCompact(amount) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return `₹${amount}`
}
