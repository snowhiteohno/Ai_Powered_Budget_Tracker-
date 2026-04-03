import { useMemo } from 'react'
import { useFinanceContext } from '../context/FinanceContext'

/**
 * Custom hook that provides filtered, searched, and sorted transactions.
 * Also provides computed analytics like totals and category breakdowns.
 */
export function useTransactions(filters = {}) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceContext()

  const {
    searchQuery = '',
    categoryFilter = 'All',
    typeFilter = 'All',
    dateFrom = '',
    dateTo = '',
    sortBy = 'date',
    sortOrder = 'desc'
  } = filters

  // Filter, search, and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    // Search by title or notes
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (categoryFilter !== 'All') {
      result = result.filter(t => t.category === categoryFilter)
    }

    // Filter by type
    if (typeFilter !== 'All') {
      result = result.filter(t => t.type === typeFilter)
    }

    // Filter by date range
    if (dateFrom) {
      result = result.filter(t => t.date >= dateFrom)
    }
    if (dateTo) {
      result = result.filter(t => t.date <= dateTo)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = new Date(a.date) - new Date(b.date)
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category)
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [transactions, searchQuery, categoryFilter, typeFilter, dateFrom, dateTo, sortBy, sortOrder])

  // Computed analytics
  const analytics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const netBalance = totalIncome - totalExpenses

    // Category breakdown (expenses only)
    const categoryBreakdown = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] = 0
        }
        categoryBreakdown[t.category] += t.amount
      })

    // Find top spending category
    let topCategory = 'None'
    let topCategoryAmount = 0
    Object.entries(categoryBreakdown).forEach(([category, amount]) => {
      if (amount > topCategoryAmount) {
        topCategory = category
        topCategoryAmount = amount
      }
    })

    // Recurring expenses
    const recurringExpenses = transactions.filter(t => t.recurring && t.type === 'expense')
    const totalRecurring = recurringExpenses.reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      categoryBreakdown,
      topCategory,
      topCategoryAmount,
      recurringExpenses,
      totalRecurring,
      transactionCount: transactions.length
    }
  }, [transactions])

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    analytics,
    addTransaction,
    updateTransaction,
    deleteTransaction
  }
}
