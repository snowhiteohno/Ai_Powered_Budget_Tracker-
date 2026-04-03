import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini with API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

let genAI = null
let model = null

if (API_KEY && API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(API_KEY)
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
}

/**
 * Check if Gemini is configured and available
 */
export function isGeminiAvailable() {
  return model !== null
}

/**
 * Helper: wait for a given number of milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Helper: call Gemini with automatic retry on 429 (rate limit) errors.
 * Retries up to 3 times with exponential backoff.
 */
async function callWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      const is429 = error?.message?.includes('429') ||
                     error?.status === 429 ||
                     error?.message?.includes('quota') ||
                     error?.message?.includes('RESOURCE_EXHAUSTED')

      if (is429 && attempt < maxRetries) {
        // Parse retry delay from error if available, otherwise use exponential backoff
        const waitSeconds = Math.min(30, Math.pow(2, attempt + 1) * 5) // 10s, 20s, 30s
        console.warn(`Gemini rate limited. Retrying in ${waitSeconds}s... (attempt ${attempt + 1}/${maxRetries})`)
        await sleep(waitSeconds * 1000)
        continue
      }

      // If we've exhausted retries or it's not a 429, throw with context
      if (is429) {
        throw new Error('QUOTA_EXCEEDED')
      }
      throw error
    }
  }
}

/**
 * Generate AI financial insights based on transaction data.
 * Analyzes spending patterns and provides actionable advice.
 */
export async function generateFinancialInsights(transactions, budget) {
  if (!model) {
    return 'Gemini API key not configured. Add your key to the .env file.'
  }

  // Prepare a summary of user's financial data
  const expenses = transactions.filter(t => t.type === 'expense')
  const incomes = transactions.filter(t => t.type === 'income')

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

  // Category breakdown
  const categoryTotals = {}
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
  })

  const recurringExpenses = expenses.filter(t => t.recurring)
  const recurringTotal = recurringExpenses.reduce((sum, t) => sum + t.amount, 0)

  // Build compact category string: "Food:2500,Transport:800"
  const cats = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([c, a]) => `${c}:${a}`)
    .join(',')

  const prompt = `Finance advisor. 3-4 bullet insights, 1 sentence each, use ₹.
Income:${totalIncome} Expenses:${totalExpenses} Savings:${totalIncome - totalExpenses} Budget:${budget} Used:${budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0}%
Categories: ${cats}
Recurring:${recurringTotal}(${recurringExpenses.length})`

  try {
    return await callWithRetry(prompt)
  } catch (error) {
    console.error('Gemini API error:', error)
    if (error.message === 'QUOTA_EXCEEDED') {
      return '⚠️ API quota exceeded — your free-tier Gemini limit has been reached. Please wait a few minutes and try again, or enable billing at console.cloud.google.com for higher limits.'
    }
    return 'Unable to generate insights right now. Please try again later.'
  }
}

/**
 * Chat with the AI financial advisor.
 * Takes user question and financial context, returns AI response.
 */
export async function askFinancialAdvisor(question, transactions, budget) {
  if (!model) {
    return 'Gemini API key not configured. Add your key to the .env file.'
  }

  const expenses = transactions.filter(t => t.type === 'expense')
  const incomes = transactions.filter(t => t.type === 'income')
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

  const categoryTotals = {}
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
  })

  const cats = Object.entries(categoryTotals).map(([c, a]) => `${c}:${a}`).join(',')

  const prompt = `Finance advisor. Answer in 2-3 sentences, use ₹.
Income:${totalIncome} Expenses:${totalExpenses} Budget:${budget}
Categories: ${cats}
Q: ${question}`

  try {
    return await callWithRetry(prompt)
  } catch (error) {
    console.error('Gemini API error:', error)
    if (error.message === 'QUOTA_EXCEEDED') {
      return '⚠️ API quota exceeded — your free-tier limit has been reached. Wait a few minutes and try again.'
    }
    return 'Sorry, I could not process your question. Please try again.'
  }
}
