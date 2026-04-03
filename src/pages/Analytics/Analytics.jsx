import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdBarChart, MdShowChart, MdPieChart, MdCurrencyExchange } from 'react-icons/md'
import { useTransactions } from '../../hooks/useTransactions'
import { formatCurrency } from '../../utils/currencyFormatter'
import { CategoryPieChart, SpendingTrendChart, IncomeVsExpenseChart } from '../../components/Charts/Charts'
import { fetchExchangeRates, POPULAR_CURRENCIES } from '../../services/api'
import { format, subMonths } from 'date-fns'
import './Analytics.css'

function Analytics() {
  const { allTransactions, analytics } = useTransactions()
  const { totalExpenses, categoryBreakdown, topCategory, topCategoryAmount } = analytics

  const [exchangeRates, setExchangeRates] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [convertAmount, setConvertAmount] = useState(10000)
  const [isLoadingRates, setIsLoadingRates] = useState(false)

  useEffect(() => {
    async function loadRates() {
      setIsLoadingRates(true)
      try {
        const data = await fetchExchangeRates('INR')
        setExchangeRates(data.rates)
      } catch (err) {
        console.error('Failed to load exchange rates')
      }
      setIsLoadingRates(false)
    }
    loadRates()
  }, [])

  const monthlyData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthNum = monthDate.getMonth()
      const yearNum = monthDate.getFullYear()
      const monthLabel = format(monthDate, 'MMM')
      const monthIncome = allTransactions
        .filter(t => {
          if (t.type !== 'income') return false
          const d = new Date(t.date)
          return d.getMonth() === monthNum && d.getFullYear() === yearNum
        })
        .reduce((sum, t) => sum + t.amount, 0)
      const monthExpenses = allTransactions
        .filter(t => {
          if (t.type !== 'expense') return false
          const d = new Date(t.date)
          return d.getMonth() === monthNum && d.getFullYear() === yearNum
        })
        .reduce((sum, t) => sum + t.amount, 0)
      months.push({ month: monthLabel, income: monthIncome, expenses: monthExpenses })
    }
    return months
  }, [allTransactions])

  const trendData = useMemo(() => {
    return monthlyData.map(m => ({ month: m.month, expenses: m.expenses }))
  }, [monthlyData])

  const additionalStats = useMemo(() => {
    let highestMonth = { month: '-', amount: 0 }
    let lowestMonth = { month: '-', amount: Infinity }
    monthlyData.forEach(m => {
      if (m.expenses > highestMonth.amount) highestMonth = { month: m.month, amount: m.expenses }
      if (m.expenses < lowestMonth.amount && m.expenses > 0) lowestMonth = { month: m.month, amount: m.expenses }
    })
    if (lowestMonth.amount === Infinity) lowestMonth = { month: '-', amount: 0 }
    const monthsWithSpending = monthlyData.filter(m => m.expenses > 0)
    const avgMonthlySpend = monthsWithSpending.length > 0
      ? Math.round(monthsWithSpending.reduce((s, m) => s + m.expenses, 0) / monthsWithSpending.length)
      : 0
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, amount]) => ({
        name, amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      }))
    return { highestMonth, lowestMonth, avgMonthlySpend, topCategories }
  }, [monthlyData, categoryBreakdown, totalExpenses])

  const convertedAmount = useMemo(() => {
    if (!exchangeRates || !exchangeRates[selectedCurrency]) return null
    return convertAmount * exchangeRates[selectedCurrency]
  }, [exchangeRates, selectedCurrency, convertAmount])

  const selectedCurrencyInfo = POPULAR_CURRENCIES.find(c => c.code === selectedCurrency)

  const statCards = [
    { icon: <MdBarChart />, label: 'Highest Spending', value: additionalStats.highestMonth.month, sub: formatCurrency(additionalStats.highestMonth.amount), color: 'red' },
    { icon: <MdShowChart />, label: 'Lowest Spending', value: additionalStats.lowestMonth.month, sub: formatCurrency(additionalStats.lowestMonth.amount), color: 'green' },
    { icon: <MdBarChart />, label: 'Avg Monthly Spend', value: formatCurrency(additionalStats.avgMonthlySpend), sub: 'per month', color: 'blue' },
    { icon: <MdPieChart />, label: 'Top Category', value: topCategory, sub: formatCurrency(topCategoryAmount), color: 'purple' }
  ]

  return (
    <div className="page-container" id="analytics-page">
      <motion.h1 className="page-title" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        Financial Analytics
      </motion.h1>

      <div className="grid-4 analytics-stats">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} className="glass-card analytics-stat-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className={`analytics-stat-icon analytics-stat-icon--${stat.color}`}>{stat.icon}</div>
            <span className="analytics-stat-label">{stat.label}</span>
            <span className="analytics-stat-value">{stat.value}</span>
            <span className="analytics-stat-sub">{stat.sub}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid-2 analytics-charts">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="section-title">Spending by Category</h3>
          <CategoryPieChart data={categoryBreakdown} />
        </motion.div>
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="section-title">Income vs Expenses</h3>
          <IncomeVsExpenseChart data={monthlyData} />
        </motion.div>
      </div>

      <motion.div className="glass-card analytics-trend" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="section-title">Monthly Spending Trend</h3>
        <SpendingTrendChart data={trendData} />
      </motion.div>

      <div className="grid-2 analytics-bottom">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h3 className="section-title">Top Spending Categories</h3>
          <div className="top-categories">
            {additionalStats.topCategories.map((cat, i) => (
              <div key={cat.name} className="top-category-item">
                <div className="top-category-rank">{i + 1}</div>
                <div className="top-category-info">
                  <span className="top-category-name">{cat.name}</span>
                  <span className="top-category-amount">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="top-category-percentage">{cat.percentage}%</div>
              </div>
            ))}
            {additionalStats.topCategories.length === 0 && <p className="empty-state-text">No expense data yet</p>}
          </div>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="section-title"><MdCurrencyExchange style={{ verticalAlign: 'middle', marginRight: '8px' }} />Currency Converter</h3>
          <div className="converter-form">
            <div className="form-group">
              <label className="form-label" htmlFor="convert-amount">Amount (INR)</label>
              <div className="amount-input-wrapper">
                <span className="amount-prefix">₹</span>
                <input type="number" className="form-input amount-input" value={convertAmount}
                  onChange={e => setConvertAmount(Number(e.target.value) || 0)} id="convert-amount" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="target-currency">Convert To</label>
              <select className="form-select" value={selectedCurrency}
                onChange={e => setSelectedCurrency(e.target.value)} id="target-currency">
                {POPULAR_CURRENCIES.filter(c => c.code !== 'INR').map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div className="converter-result">
              {isLoadingRates ? (
                <span className="converter-loading">Loading rates...</span>
              ) : convertedAmount !== null ? (
                <>
                  <span className="converter-converted-value">
                    {selectedCurrencyInfo?.symbol}{convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span className="converter-rate">
                    1 INR = {exchangeRates?.[selectedCurrency]?.toFixed(6)} {selectedCurrency}
                  </span>
                </>
              ) : (
                <span className="converter-loading">Rates unavailable</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
