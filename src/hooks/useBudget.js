import { useMemo } from 'react'
import { useFinanceContext } from '../context/FinanceContext'

/**
 * Custom hook for budget calculations.
 * Returns budget info including remaining, percentage used, and status.
 */
export function useBudget() {
  const { transactions, budget, updateBudget } = useFinanceContext()

  const budgetData = useMemo(() => {
    // Calculate total expenses for the current month
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyExpenses = transactions
      .filter(t => {
        if (t.type !== 'expense') return false
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const remaining = budget - monthlyExpenses
    const percentageUsed = budget > 0 ? Math.round((monthlyExpenses / budget) * 100) : 0

    // Determine status
    let status = 'on-track'
    if (percentageUsed >= 100) {
      status = 'over-budget'
    } else if (percentageUsed >= 80) {
      status = 'warning'
    }

    // Daily average
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const dayOfMonth = now.getDate()
    const dailyAverage = dayOfMonth > 0 ? Math.round(monthlyExpenses / dayOfMonth) : 0
    const projectedMonthly = dailyAverage * daysInMonth

    // Category-wise breakdown for current month
    const categorySpending = {}
    transactions
      .filter(t => {
        if (t.type !== 'expense') return false
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        )
      })
      .forEach(t => {
        if (!categorySpending[t.category]) {
          categorySpending[t.category] = 0
        }
        categorySpending[t.category] += t.amount
      })

    return {
      monthlyBudget: budget,
      totalSpent: monthlyExpenses,
      remaining,
      percentageUsed,
      status,
      dailyAverage,
      projectedMonthly,
      categorySpending
    }
  }, [transactions, budget])

  return {
    ...budgetData,
    updateBudget
  }
}
